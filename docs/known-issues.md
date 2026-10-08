# Known issues, quirks, and tech debt

Verified against v1.14.0 on 2026-09-29. Each item notes whether it is safe to change freely or whether it
touches public behavior (CLI output, exit codes, result object) and therefore needs a deliberate decision.

When you fix one of these, delete or update its entry in the same PR.

## Behavior quirks (public API — changing them is a breaking change)

### `status` is 0 even when the environment is invalid
`lib/checkSystem.js:55-67` only sets `message`; `status` is set to `-1` solely for fatal setup errors
(`:31`, `:41`). Programmatic consumers must check `result.message.type === 'success'`, not `status`.
The README used to say otherwise. Related: issue #41 (redundant `status` / `message.type`).

A test depends on this: `lib/checkSystem.spec.js` "does not throw when engines key exists" asserts
`status === 0` for `node: '5.10.1'`, which passes even though that validation fails.

### `foundVersion` is misleading
- On success it echoes the expected range, not the detected version (`lib/checkSystem.js:91`). Output reads
  "node was validated with >=18." rather than showing the real version.
- On failure it is the raw trimmed stdout (`:100`), e.g. `git version 2.52.0`, not a parsed version.

### `packages` order is nondeterministic
Results are pushed inside each exec callback (`lib/checkSystem.js:76`, `:87`, `:96`, `:107`), so order is
completion order, not `engines` order. The CLI output order can vary run to run. Unknown-validator entries
(synchronous) always appear first.

### Engines without a validator fail the whole check
An unknown key is reported as `warn` but resolves `false` (`lib/checkSystem.js:81`), so the environment is
"invalid" and the CLI exits 1. Any project listing an unsupported tool in `engines` cannot pass without `--ignore`.

### Fatal errors exit with 255 and a misleading message
- `process.exit(-1)` (`bin/check-engine.js:85`) becomes exit code 255.
- The catch at `lib/checkSystem.js:26` covers both "file missing" and "invalid JSON", and the message always
  says "`<path>` not found in the current directory" even when an explicit path was given.
- Related: issue #33 (exit code = number of failed validators).

## Validator quirks

- **No version in output → TypeError.** If stdout has nothing version-like, `semver.coerce` returns `null` and
  `.version` throws (`lib/validatorRules.js:6`). It is caught and surfaces as `commandError: TypeError...`
  instead of a friendly "version not found".
- **First version-looking token wins.** `semver.coerce` takes the first `x.y.z` in the output. Tools that print
  another version first (e.g. a runtime or API version banner) need a custom `versionValidate`.
- **Shell/OS specific commands.** Rules with pipes (`gulp-cli`, `libimobiledevice`, `deviceconsole`,
  `check-engine` use `| grep`) don't work in Windows `cmd.exe`; `windows` (`ver`) only works on Windows;
  `ios-webkit-debug-proxy`, `ideviceinstaller`, `libimobiledevice` require Homebrew; `osx` requires macOS.
  There is no per-platform gating (issue #40).
- **Global-only detection.** `gulp-cli`, `deviceconsole`, `check-engine` grep `npm list -g`, so local installs
  are not seen, and the `grep` is a substring match.
- **`java` checks `javac`**, i.e. the JDK, not the JRE; `2>&1` is there because older `javac` prints to stderr.
- **Stale tools.** `jx` (JXcore), `bower`, `nsp`, `ios-sim`, `deviceconsole` are dead/deprecated upstream. They are
  kept for backward compatibility; removing a key is a breaking change for anyone listing it.
- **`cordova` + telemetry prompt** can hang or pollute output (issue #35).

## Test-suite weaknesses (safe to fix)

- `t.assert(result.packages[1].type, 'error')` in `lib/checkSystem.spec.js` (lines ~74-75, ~120-121) only
  asserts truthiness — the second arg is the message. These should be `t.equal`, and should look packages up by
  name rather than index (see ordering above).
- Several tests run real `node -v` / `npm -v`, so results depend on the host.
- Tests only exercise `versionValidate` via `checkSystem`; there are no direct unit tests of `validatorRules`.
- `bin/check-engine.js` has no tests at all (exit codes, `--ignore`, output formatting).

## Tooling / dependency debt

- **`engines.node` is `^20.19.0 || >=22.12.0` because of ESM-only deps.** `yargs@18` ships only ESM and is
  loaded with `require()`, which relies on `require(esm)` (unflagged in Node 20.19 / 22.12). `eslint@10` has
  the same floor. CI tests 20.x, 22.x, 24.x. Lowering the floor means pinning yargs back to 17.
- **Bluebird (issue #83).** Replacing it with native promises is desirable but has traps:
  - `Promise.promisify(exec)` resolves the **stdout string**; `util.promisify(exec)` resolves
    **`{ stdout, stderr }`**. Callers must be adjusted.
  - `.reflect()` / `isFulfilled()` / `value()` map to native `Promise.allSettled` →
    `{ status: 'fulfilled', value }`.
  - **Tests will pass while production breaks.** The real `exec` has a `util.promisify.custom` hook that yields
    `{ stdout, stderr }`; the proxyquire stubs don't, so under `util.promisify` the stub resolves a plain string.
    Code that treats the result as a string passes every test and fails on real commands. Write a small local
    `new Promise((resolve, reject) => exec(cmd, (err, stdout) => ...))` wrapper instead, and verify with
    `npm start` (real exec), not just `npm test`.
- **`colors` pinned to 1.4.0** on purpose (post-1.4.0 releases were sabotaged in Jan 2022). It also mutates
  `String.prototype`. A future swap to `picocolors`/`chalk` is fine but must preserve the output.
- **Unused jasmine globals.** `eslint.config.js` still declares jasmine/mocha globals (`describe`, `spyOn`, …)
  carried over from the old `.eslintrc.js`; nothing uses them.
- **Lint glob is shell-expanded.** `eslint bin/**/*.js lib/**/*.js` is unquoted; `sh` has no globstar, so `**`
  acts like `*`. Fine while the tree is flat; quote the globs if subdirectories are added.
- **`lib/checkSystem.js` quirks that are safe to clean up:** `require`s live inside the exported function
  (`:5-11`); `.catch((e) => { throw e; })` at `:124` is a no-op; `validate`'s catch rejects with `undefined` (`:114`).
