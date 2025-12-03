# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability within check-engine, please follow these steps:

1. **Do not** open a public GitHub issue for security vulnerabilities.

2. **Email the maintainer** directly at the email address listed in the package.json or use GitHub's private vulnerability reporting feature.

3. **Include details** such as:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Any potential fixes you may have identified

4. **Allow time for response**: We will acknowledge your report within 48 hours and provide a more detailed response within 7 days.

## Security Measures

This project implements the following security measures:

- **Dependency Scanning**: Dependabot is configured to automatically check for and update vulnerable dependencies.
- **Security Audits**: `npm audit` is run as part of the CI/CD pipeline to detect known vulnerabilities.
- **Static Analysis**: CodeQL is used to analyze the codebase for potential security issues.
- **Minimal Dependencies**: We strive to keep dependencies minimal and well-maintained.

## Best Practices for Users

When using check-engine:

1. Always use the latest version to ensure you have the most recent security patches.
2. Run `npm audit` in your projects to check for known vulnerabilities.
3. Keep your Node.js version up to date (we require Node.js 18 or higher).

## Disclosure Policy

- We will confirm the issue and work on a fix as quickly as possible.
- We will release the fix and publish a new version.
- We will credit reporters who wish to be credited in release notes.
- We follow responsible disclosure practices and ask that you do the same.

Thank you for helping keep check-engine and its users safe!
