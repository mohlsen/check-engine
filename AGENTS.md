# AGENTS.md

Guidance for AI coding agents (Claude Code, Copilot, Codex, Cursor, etc.) working in this repo.
Humans are welcome too. Keep this file accurate; if you change behavior it describes, update it in the same PR.

## What this project is

`check-engine` is a small, published npm CLI + library (`npm i -g check-engine`) that reads the
[`engines`](https://docs.npmjs.com/cli/configuring-npm/package-json#engines) object from a `package.json`,
runs a shell command per engine key to discover the installed version, and checks it against the declared
semver range. It prints a colored report and exits non-zero when the environment is invalid.

It was written ~2016 (pre-ES2017 style: Bluebird promises, CommonJS, tape tests) and is lightly maintained.
It has real downstream users, so **the CLI output, exit codes, and the programmatic result object are a public API**.

## Commands

```bash
npm ci              # install (use ci, not install, unless you are intentionally changing deps)
npm test            # tape lib/*.spec.js | tap-min   (~120 assertions, <1s)
npm run lint        # eslint 8 with legacy .eslintrc.js
npm start           # run the CLI against this repo's own package.json
node bin/check-engine.js path/to/package.json [--ignore] [--help] [--version]
```

Always run **both** `npm test` and `npm run lint` before declaring work done. CI
(`.github/workflows/validation.yml`) runs exactly these on Node 20.x and 22.x.

## Layout

```
bin/check-engine.js        CLI: arg parsing (yargs), help text (command-line-usage), colored output, exit codes
lib/checkSystem.js         Core: read package.json → run validators in parallel → build result object (package "main")
lib/validatorRules.js      Map of engine key → { versionCheck: shell command, versionValidate(stdout, range) }
lib/promiseHelpers.js      allSettled() built on Bluebird .reflect()
lib/*.spec.js              tape tests; child_process / jsonfile / fs are stubbed with proxyquire
lib/readme.spec.js         fails if a validator key is missing from the README "Supported Dependencies" table
docs/                      Deeper knowledge for agents and maintainers (see below)
```

There is no build step, no transpilation, no TypeScript. Code runs as-is on Node.

## Deeper docs — read before non-trivial changes

- [docs/architecture.md](docs/architecture.md) — data flow, the result-object contract, exit codes, test harness.
- [docs/known-issues.md](docs/known-issues.md) — verified quirks, bugs, and tech debt. **Read this before
  "fixing" something that looks wrong**; several oddities are load-bearing or covered by open issues.
- [docs/adding-a-validator.md](docs/adding-a-validator.md) — step-by-step recipe for the most common contribution.

## Code conventions

Match the surrounding code. Enforced by ESLint (`.eslintrc.js`):

- 4-space indent, semicolons required, max line length 120.
- `const`/`let` only (`no-var`), one declaration per statement (`one-var: never`).
- Stroustrup braces: `}` then `else` on the next line.
- Arrow functions always parenthesize params: `(x) => ...`.
- No space before function parens: `function foo()`.
- Quote style is not enforced; `lib/validatorRules.js` uses double quotes, most other files use single. Follow the file.
- CommonJS (`require` / `module.exports`), `'use strict'` at the top of modules.
- Promises are **Bluebird**, not native, inside `lib/checkSystem.js` (see known-issues before swapping).

## Testing conventions

- Framework is `tape` + `proxyquire`. No mocha/jest globals (the jasmine globals in `.eslintrc.js` are leftovers).
- Validator tests (`lib/validatorRules.spec.js`) stub `child_process.exec` to return canned stdout and stub
  `jsonfile.readFileSync` to return a fake `package.json`. Copy the existing `setupChecker(packageJSON, stdout)`
  pattern; paste **real** output captured from the tool (including banners/extra lines) as the canned stdout.
- The exec stub signature is `(command, cb)` — two args. If you change how `exec` is called
  (options arg, `execFile`, `util.promisify`), you must update the stubs in both spec files.
- Some tests in `lib/checkSystem.spec.js` run real `node -v` / `npm -v`; they need both on `PATH`.
- Prefer `t.equal` over `t.assert`. `t.assert(value, 'msg')` only checks truthiness (existing tests misuse this).
- Don't index `result.packages[n]` in multi-engine tests; order is not guaranteed. Use `.find((p) => p.name === ...)`.

## Boundaries

Do without asking:
- Add/adjust validators with tests, fix bugs with tests, improve docs, tighten tests.

Ask first (or call it out prominently in the PR):
- Any change to CLI output text, exit codes, CLI flags, or the result object shape — these are public API
  and need a semver-major bump if they break consumers.
- Raising `engines.node` in `package.json`, adding/removing runtime dependencies, or major-version dep bumps.
- Converting to ESM, TypeScript, or a different test framework.

Never:
- Run `npm publish`, `npm version`, push tags, or create GitHub releases — the maintainer does releases.
- Bump `colors` past `1.4.0` (versions after it were sabotaged by the author in 2022). Replacing `colors` with
  another library is fine as a deliberate, reviewed change.
- Commit `node_modules`, or regenerate `package-lock.json` unless you are intentionally changing dependencies.

## Git / PR workflow

- Default branch is `master`. Work on a feature branch; open a PR against `master`.
- Dependabot opens grouped weekly PRs (`.github/dependabot.yml`); don't duplicate its work.
- Keep PRs focused. If you touch behavior, update README.md and the relevant `docs/` file in the same PR.

## Open work (as of 2026-09-29)

Check `gh issue list` / `gh pr list` for current state. Notable context:
- Draft PRs #108 (MODERNIZATION_PLAN.md) and #109 (Phase 1: Node ≥18, ESLint 9 flat config, CI/security docs)
  were produced by Copilot and have not been merged. Coordinate with them rather than redoing that work.
- PR #106 (dependabot major bumps incl. ESLint 9) will break lint without the flat-config migration.
- PR #102 proposes new validator rules.
- Long-standing feature issues: #107 (CLI checks without a package.json, e.g. `--node 22`), #83 (drop
  Bluebird), #75 (`--quiet`), #41 (redundant `status`/`message.type`), #40 (per-OS validators),
  #33 (exit code = number of failures), #57 (angular-cli validator).
