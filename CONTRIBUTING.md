# Contributing to check-engine

Thank you for your interest in contributing to check-engine! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Adding New Validators](#adding-new-validators)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- Git

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/check-engine.git
   cd check-engine
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Verify your setup:
   ```bash
   npm test
   npm run lint
   ```

## Development Workflow

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the [coding standards](#coding-standards).

3. Write or update tests as needed.

4. Run tests and linting:
   ```bash
   npm test
   npm run lint
   ```

5. Commit your changes with a clear commit message:
   ```bash
   git commit -m "Add: description of your changes"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. Open a Pull Request against the `master` branch.

## Pull Request Process

1. Ensure all tests pass and there are no linting errors.
2. Update documentation if needed (README.md, etc.).
3. Include a clear description of the changes and their purpose.
4. Link any related issues in the PR description.
5. Wait for review from maintainers.
6. Address any requested changes.
7. Once approved, a maintainer will merge your PR.

## Adding New Validators

To add support for a new tool/dependency:

1. Open `lib/validatorRules.js`

2. Add a new entry in the module.exports object:
   ```javascript
   "your-tool": {
       versionCheck: "your-tool --version",
       versionValidate
   },
   ```

3. The `versionCheck` property should be a command that outputs the version.

4. Most tools can use the standard `versionValidate` function which uses semver. If your tool requires custom version parsing, you can provide a custom validation function.

5. Add tests in `lib/validatorRules.spec.js`:
   ```javascript
   t.test('your-tool version', (t) => {
       const checkSystem = setupChecker(
           { engines: { "your-tool": "1.0.0" } },
           'v1.0.0'
       );

       checkSystem().then((result) => {
           t.equal(result.packages[0].name, 'your-tool');
           t.equal(result.packages[0].type, 'success');
           t.equal(result.packages[0].validatorFound, true);
           t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
           t.end();
       });
   });
   ```

6. Update the README.md to include your new validator in the supported dependencies table.

## Coding Standards

- Use 4 spaces for indentation
- Use semicolons at the end of statements
- Use single quotes for strings (unless the string contains a single quote)
- Maximum line length is 120 characters
- Use `const` and `let` instead of `var`
- Use ES6+ features where appropriate
- Follow existing code patterns in the project

Run the linter to check your code:
```bash
npm run lint
```

## Testing

- Write tests for all new functionality
- Ensure existing tests pass before submitting
- Use the existing tape testing framework
- Mock external dependencies using proxyquire

Run tests:
```bash
npm test
```

## Questions?

If you have questions about contributing, feel free to open an issue for discussion.

Thank you for contributing to check-engine!
