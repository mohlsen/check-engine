---
name: add-validator
description: Add support for a new tool (engine key) to check-engine — rule in lib/validatorRules.js, tests from real output, README row. Use when asked to "add a validator", "support <tool>", or "add a rule for <tool>".
---

# Add a validator

Follow `docs/adding-a-validator.md` exactly; this skill is the checklist for doing it end to end.

Input: the tool name (and optionally the engine key users will write). If the user didn't give one, ask.

1. **Check it doesn't already exist**: `grep -n '<key>' lib/validatorRules.js`. Also check open PRs
   (`gh pr list --search <tool>`) — PR #102 proposes several rules.
2. **Capture real output.** If the tool is installed, run its version command and use the exact output. If it is
   not installed, find the documented output format (official docs / release notes) and say in your summary that
   the canned output was not captured locally.
3. **Decide standard vs custom `versionValidate`.** Standard only if the first `x.y.z` token in the output is the
   tool's version. Confirm with:
   `node -e "console.log(require('semver').coerce(process.argv[1]))" "<output>"`
4. **Add the rule** at the end of `lib/validatorRules.js` (double quotes, 4-space indent).
5. **Add tests** to `lib/validatorRules.spec.js` using the `setupChecker(packageJSON, stdout)` pattern: one passing
   case, plus an out-of-range case if the format is unusual.
6. **README**: add a row to the Supported Dependencies table (key + command) and a link reference.
7. **Verify**: `npm test` and `npm run lint` must pass. If the tool is installed, also do a real run with a temp
   package.json (`node bin/check-engine.js <tmp>.json`).
8. **Report**: the key added, the command, sample output used and where it came from, and any OS/shell limits.
