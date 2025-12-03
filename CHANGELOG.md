# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Updated minimum Node.js version requirement to >=18 (LTS)
- Updated ESLint to v9.x with new flat config format
- Updated dependencies: jsonfile, semver
- Added Node.js 18.x to CI test matrix
- Updated GitHub Actions to use actions/checkout@v4 and actions/setup-node@v4

### Added
- Added npm audit security check to CI/CD pipeline
- Added CodeQL workflow for static security analysis
- Added SECURITY.md with vulnerability reporting process
- Added CONTRIBUTING.md with development guidelines
- Added CODE_OF_CONDUCT.md
- Added this CHANGELOG.md

### Fixed
- Fixed security vulnerabilities in dependencies (brace-expansion, cross-spawn, js-yaml)

## [1.14.0] - Previous Release

See [GitHub Releases](https://github.com/mohlsen/check-engine/releases) for previous release notes.
