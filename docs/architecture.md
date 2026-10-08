# Architecture

check-engine is ~250 lines of runtime code across four files. This doc explains how they fit together and
which behaviors are part of the public contract.

## Data flow

```
bin/check-engine.js
  │  parse argv (yargs): positional [file], --ignore, --help/-h, --version/-v
  │  --help → print command-line-usage text, exit 0
  │  --version → yargs prints package.json version, exit 0
  ▼
lib/checkSystem.js  check(pathToPackage?)  →  Promise<Result>   (always resolves, never rejects)
  │  1. path = pathToPackage || <cwd>/package.json
  │  2. fs.accessSync + jsonfile.readFileSync → engines
  │       any throw (missing file, bad JSON) → resolve { status: -1, message: {type:'error', ...} }
  │       no `engines` key                   → resolve { status: -1, message: {type:'error', ...} }
  │  3. for each key in engines, in parallel:
  │       rule = validatorRules[key]
  │         none      → push { name, validatorFound:false, type:'warn' }, counts as FAILED
  │         found     → exec(rule.versionCheck)   (child_process.exec via shell, promisified by Bluebird)
  │                       → rule.versionValidate(stdout, engines[key])
  │                         true  → push { type:'success', ... }
  │                         false → push { type:'error', foundVersion: stdout.trim() || 'missing', ... }
  │                       exec error or validate throws → push { type:'error', commandError: err }
  │  4. promiseHelpers.allSettled(all) → every fulfilled && truthy ?
  │       message = { type:'success', text:'Environment looks good!' }
  │       message = { type:'error',   text:'Environment is invalid!' }
  │     status stays 0 in both cases
  ▼
bin/check-engine.js
     status !== 0 → print message, process.exit(status)            → exit code 255 for -1
     print one line per package (✔ success / warn / ✘ error)
     message.type !== 'success' → print summary, exit(--ignore ? 0 : 1)
     else print "Environment looks good!", exit 0 (natural exit)
```

## The result object (public API)

`require('check-engine')` exports `check(pathToPackage?)`. The resolved object:

```js
{
    status: 0 | -1,        // -1 ONLY for fatal setup errors (package.json unreadable, no engines key).
                           // An invalid environment still has status 0 — check message.type.
    message: {
        text: string,      // human summary
        type: 'success' | 'error'
    },
    packages: [            // empty when status === -1. ORDER IS NOT GUARANTEED (completion order of exec calls).
        {
            name: string,             // engines key
            type: 'success' | 'error' | 'warn',
            validatorFound: boolean,  // false → type is 'warn' and no other fields are set
            expectedVersion: string,  // the range from package.json (when validatorFound)
            foundVersion: string,     // success: echoes expectedVersion (not the real version!)
                                      // error:   raw trimmed stdout of the version command, or 'missing'
            commandError: any         // set when exec failed or versionValidate threw; foundVersion absent
        }
    ]
}
```

`bin/check-engine.js` is itself the reference consumer of this object; any change to it must keep the CLI
working and should be treated as a breaking change for library users.

## Exit codes (public API)

| Situation                                              | Exit code |
|--------------------------------------------------------|-----------|
| `--help`, `--version`                                  | 0         |
| All engines validated                                  | 0         |
| Any engine failed / errored / has no validator         | 1         |
| Same, with `--ignore`                                  | 0         |
| package.json missing/unparseable, or no `engines` key  | 255 (`process.exit(-1)`) — `--ignore` does not apply |

## Validators

`lib/validatorRules.js` exports a plain object keyed by the exact `engines` key users write in `package.json`:

```js
someTool: {
    versionCheck: "some-tool --version",   // run through the platform shell (sh / cmd.exe); pipes allowed
    versionValidate                         // (stdout: string, range: string) => boolean
}
```

Every current rule uses the shared `versionValidate`, which is
`semver.satisfies(semver.coerce(stdout).version, range)`. `semver.coerce` pulls the **first** `x.y.z`-looking
token out of arbitrary text, which is why rules can pass raw output like `git version 2.39.0 (Apple Git-66)`.
All validators therefore support full semver ranges (`^`, `~`, `>=`, `x`, `*`, `||`).

A rule may supply a custom `versionValidate` when the first version-looking token in the output is the wrong
one. See [adding-a-validator.md](adding-a-validator.md).

## Dependencies and why they exist

| Package              | Used in               | Purpose |
|----------------------|-----------------------|---------|
| `bluebird`           | checkSystem, promiseHelpers | `promisify(exec)` (resolves stdout string only) and `.reflect()` for allSettled |
| `semver`             | validatorRules        | `coerce` + `satisfies` |
| `jsonfile`           | checkSystem           | read package.json (stubbed in tests) |
| `yargs`              | bin                   | argv parsing, `--version` |
| `command-line-usage` | bin                   | `--help` text |
| `colors`             | bin                   | colored output via `String.prototype` extensions (`'text'.error`) and a custom theme. Pinned to 1.4.0 — do not bump. |

Dev: `tape`, `tap-min` (reporter), `proxyquire` (module stubbing), `eslint` 10 (flat config, `eslint.config.js`).

## Test harness

- `npm test` = `tape lib/*.spec.js | tap-min`.
- `proxyquire('./checkSystem', { child_process: {...}, jsonfile: {...}, fs: {...} })` loads a fresh copy of
  `checkSystem` with stubs. It works because `checkSystem.js` `require`s those modules by name.
- `lib/validatorRules.spec.js` tests rules *through* `checkSystem` with a stubbed exec that calls
  `cb(0, cannedStdout)` — it asserts on the result object, not on `versionValidate` directly.
- `lib/checkSystem.spec.js` covers the orchestration: missing file, missing engines, exec errors, missing
  validators. A few of these tests execute real `node -v` / `npm -v`.
- `lib/readme.spec.js` keeps the README's Supported Dependencies table in sync with `validatorRules` keys.
