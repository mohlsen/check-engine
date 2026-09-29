# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Breaking:** Updated minimum Node.js version requirement to `^20.19.0 || >=22.12.0`
- Updated ESLint to v10.x with new flat config format
- Updated dependencies: command-line-usage 7, yargs 18, jsonfile, semver
- Updated dev dependencies: tap-min 3, tape, globals
- CI test matrix now runs on Node.js 20.x, 22.x, and 24.x
- Updated GitHub Actions to actions/checkout@v7, actions/setup-node@v7, and github/codeql-action@v4

### Added
- Added npm audit security check to CI/CD pipeline
- Added CodeQL workflow for static security analysis
- Added SECURITY.md with vulnerability reporting process
- Added CONTRIBUTING.md with development guidelines
- Added CODE_OF_CONDUCT.md
- Added this CHANGELOG.md

### Fixed
- Fixed security vulnerabilities in dependencies (brace-expansion, cross-spawn, flatted, js-yaml, minimatch)

## [1.14.0] - Previous Release

See [GitHub Releases](https://github.com/mohlsen/check-engine/releases) for previous release notes.
