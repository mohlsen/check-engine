@AGENTS.md

## Claude Code specifics

- `AGENTS.md` (imported above) is the source of truth for all agents. Put shared guidance there, not here;
  keep this file for Claude-only notes.
- Project skill: `/add-validator` walks through adding a new tool to `lib/validatorRules.js` with tests and docs.
- Before changing anything in `lib/checkSystem.js` or `bin/check-engine.js`, read `docs/architecture.md` and
  `docs/known-issues.md`.
- Use `gh` for GitHub (issues, PRs). Repo: `mohlsen/check-engine`.
