# check-engine Testing Strategy Modernization

**Document Version:** 1.0  
**Date:** 2025-11-08  
**Status:** Planning Phase

## Current State Analysis

### Existing Test Infrastructure
- **Framework:** Tape (minimalist TAP-producing test harness)
- **Reporter:** tap-min (minimal TAP reporter)
- **Coverage:** 91 tests passing
- **Test Files:** 
  - `lib/checkSystem.spec.js` (141 lines)
  - `lib/validatorRules.spec.js` (292 lines)
- **Mocking:** proxyquire (for stubbing module dependencies)

### Strengths
- ✅ Good test coverage
- ✅ Tests are passing
- ✅ Basic mocking in place
- ✅ Tests run in CI

### Weaknesses
- ⚠️ Old testing framework (tape)
- ⚠️ No coverage reporting/tracking
- ⚠️ No integration tests
- ⚠️ No E2E tests
- ⚠️ Limited test organization
- ⚠️ No test documentation
- ⚠️ No performance/benchmark tests

---

## Recommended Modern Testing Stack

### Option 1: Vitest (Recommended)
**Best for:** Modern, fast, ESM-first projects

**Advantages:**
- ⚡ Extremely fast (uses Vite)
- 🔄 Watch mode with HMR
- 📊 Built-in coverage (via c8/v8)
- 🎯 Jest-compatible API
- 📦 ESM and TypeScript support
- 🔍 Better error messages
- 🌐 Browser mode support

**Installation:**
```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

**Configuration:**
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.spec.js',
        '**/*.test.js',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

---

### Option 2: Jest
**Best for:** Established ecosystem, extensive plugins

**Advantages:**
- 🏆 Industry standard
- 📚 Extensive documentation
- 🔌 Large plugin ecosystem
- 💾 Snapshot testing
- 🎭 Built-in mocking
- 🔄 Watch mode

**Installation:**
```bash
npm install -D jest @types/jest
```

**Configuration:**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'lib/**/*.js',
    'bin/**/*.js',
    '!**/*.spec.js',
    '!**/*.test.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '**/*.spec.js',
    '**/*.test.js',
  ],
};
```

---

## Test Organization Structure

### Proposed Directory Structure

```
check-engine/
├── lib/
│   ├── checkSystem.js
│   ├── validatorRules.js
│   └── promiseHelpers.js
├── test/
│   ├── unit/
│   │   ├── checkSystem.test.js
│   │   ├── validatorRules.test.js
│   │   └── promiseHelpers.test.js
│   ├── integration/
│   │   ├── cli.integration.test.js
│   │   ├── programmatic-api.integration.test.js
│   │   └── validators.integration.test.js
│   ├── e2e/
│   │   ├── basic-validation.e2e.test.js
│   │   ├── error-handling.e2e.test.js
│   │   └── real-projects.e2e.test.js
│   ├── fixtures/
│   │   ├── package.json.examples/
│   │   ├── mock-executables/
│   │   └── test-environments/
│   ├── helpers/
│   │   ├── mock-validator.js
│   │   ├── test-utils.js
│   │   └── assertions.js
│   └── performance/
│       ├── benchmark.test.js
│       └── load.test.js
├── coverage/
└── vitest.config.js (or jest.config.js)
```

---

## Migration Plan from Tape to Vitest/Jest

### Step 1: Setup New Framework

**Install Dependencies:**
```bash
# For Vitest
npm install -D vitest @vitest/ui @vitest/coverage-v8

# For Jest
npm install -D jest @types/jest
```

**Create Configuration:**
```javascript
// vitest.config.js
export default {
  test: {
    globals: true,
    environment: 'node',
  },
};
```

### Step 2: Create Test Helpers

**Create `test/helpers/test-utils.js`:**
```javascript
export function mockExec(command, output, exitCode = 0) {
  return vi.fn().mockImplementation(() => {
    if (exitCode !== 0) {
      return Promise.reject(new Error(output));
    }
    return Promise.resolve(output);
  });
}

export function createMockPackageJson(engines) {
  return {
    name: 'test-package',
    version: '1.0.0',
    engines,
  };
}
```

### Step 3: Migrate Tests

**Before (Tape):**
```javascript
const test = require('tape');
const proxyquire = require('proxyquire');

test('should validate node version', (t) => {
  const checkSystem = proxyquire('./checkSystem', {
    'child_process': {
      exec: (cmd, cb) => cb(null, 'v20.0.0'),
    },
  });
  
  checkSystem('./package.json').then((result) => {
    t.equal(result.status, 0);
    t.end();
  });
});
```

**After (Vitest):**
```javascript
import { describe, it, expect, vi } from 'vitest';
import { checkSystem } from './checkSystem.js';
import * as cp from 'child_process';

vi.mock('child_process');

describe('checkSystem', () => {
  it('should validate node version', async () => {
    vi.spyOn(cp, 'exec').mockImplementation((cmd, cb) => {
      cb(null, 'v20.0.0');
    });
    
    const result = await checkSystem('./package.json');
    
    expect(result.status).toBe(0);
    expect(result.message.type).toBe('success');
  });
});
```

### Step 4: Update package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run test/unit",
    "test:integration": "vitest run test/integration",
    "test:e2e": "vitest run test/e2e"
  }
}
```

### Step 5: Update CI Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - run: npm ci
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Test Types and Coverage

### 1. Unit Tests

**Purpose:** Test individual functions and modules in isolation

**Coverage:**
- All functions in `checkSystem.js`
- All validators in `validatorRules.js`
- Helper functions in `promiseHelpers.js`
- Edge cases and error conditions

**Example:**
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validatorRules } from '../lib/validatorRules.js';
import * as semver from 'semver';

describe('validatorRules', () => {
  describe('node validator', () => {
    it('should validate correct node version', () => {
      const result = validatorRules.node.versionValidate('v20.0.0', '>=18');
      expect(result).toBe(true);
    });
    
    it('should reject incorrect node version', () => {
      const result = validatorRules.node.versionValidate('v16.0.0', '>=18');
      expect(result).toBe(false);
    });
    
    it('should handle version ranges', () => {
      expect(validatorRules.node.versionValidate('v20.0.0', '^20.0.0')).toBe(true);
      expect(validatorRules.node.versionValidate('v20.5.0', '^20.0.0')).toBe(true);
      expect(validatorRules.node.versionValidate('v21.0.0', '^20.0.0')).toBe(false);
    });
  });
  
  describe('npm validator', () => {
    it('should validate npm version', () => {
      const result = validatorRules.npm.versionValidate('9.0.0', '>=8');
      expect(result).toBe(true);
    });
  });
});
```

### 2. Integration Tests

**Purpose:** Test interactions between modules and with real commands

**Coverage:**
- CLI argument parsing
- Package.json reading and parsing
- Multiple validators working together
- Error propagation
- Output formatting

**Example:**
```javascript
import { describe, it, expect } from 'vitest';
import { checkSystem } from '../lib/checkSystem.js';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('checkSystem integration', () => {
  const testPkgPath = join(__dirname, '../fixtures/test-package.json');
  
  it('should validate complete package.json', async () => {
    const pkg = {
      name: 'test',
      engines: {
        node: '>=18',
        npm: '>=8',
      },
    };
    
    writeFileSync(testPkgPath, JSON.stringify(pkg));
    
    const result = await checkSystem(testPkgPath);
    
    expect(result.status).toBe(0);
    expect(result.packages).toHaveLength(2);
    expect(result.packages[0].name).toBe('node');
    expect(result.packages[1].name).toBe('npm');
    
    unlinkSync(testPkgPath);
  });
  
  it('should handle missing package.json', async () => {
    const result = await checkSystem('./nonexistent.json');
    
    expect(result.status).toBe(-1);
    expect(result.message.type).toBe('error');
    expect(result.message.text).toContain('not found');
  });
});
```

### 3. End-to-End Tests

**Purpose:** Test complete workflows as a user would experience them

**Coverage:**
- CLI invocation with various arguments
- Real-world package.json configurations
- Error messages and exit codes
- Output formatting
- Container usage

**Example:**
```javascript
import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI E2E', () => {
  it('should run successfully with valid environment', async () => {
    const { stdout, stderr } = await execAsync(
      'node bin/check-engine.js test/fixtures/valid-package.json'
    );
    
    expect(stdout).toContain('Environment looks good');
    expect(stderr).toBe('');
  });
  
  it('should fail with invalid environment', async () => {
    try {
      await execAsync(
        'node bin/check-engine.js test/fixtures/invalid-package.json'
      );
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error.code).toBe(1);
      expect(error.stdout).toContain('Environment is invalid');
    }
  });
  
  it('should show help with --help flag', async () => {
    const { stdout } = await execAsync('node bin/check-engine.js --help');
    
    expect(stdout).toContain('check-engine');
    expect(stdout).toContain('Usage:');
  });
  
  it('should show version with --version flag', async () => {
    const { stdout } = await execAsync('node bin/check-engine.js --version');
    
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });
});
```

### 4. Performance/Benchmark Tests

**Purpose:** Track performance characteristics and prevent regressions

**Coverage:**
- Validation speed
- Memory usage
- Parallel execution performance
- Large package.json handling

**Example:**
```javascript
import { describe, it, expect, bench } from 'vitest';
import { checkSystem } from '../lib/checkSystem.js';

describe('Performance', () => {
  bench('validate small package.json', async () => {
    await checkSystem('test/fixtures/small-package.json');
  });
  
  bench('validate large package.json', async () => {
    await checkSystem('test/fixtures/large-package.json');
  });
  
  it('should complete validation in under 5 seconds', async () => {
    const start = Date.now();
    await checkSystem('test/fixtures/standard-package.json');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000);
  });
});
```

---

## Test Fixtures and Mocks

### Test Fixtures

Create reusable test data:

```javascript
// test/fixtures/packages.js
export const validPackages = {
  minimal: {
    name: 'test-minimal',
    engines: { node: '>=18' },
  },
  standard: {
    name: 'test-standard',
    engines: {
      node: '>=18',
      npm: '>=8',
      git: '>=2.30',
    },
  },
  complex: {
    name: 'test-complex',
    engines: {
      node: '>=18',
      npm: '>=8',
      yarn: '>=3',
      pnpm: '>=8',
      python: '>=3.9',
    },
  },
};

export const invalidPackages = {
  futureNode: {
    name: 'test-future',
    engines: { node: '>=99' },
  },
  noEngines: {
    name: 'test-no-engines',
  },
};
```

### Mock Executables

Create test doubles for system commands:

```javascript
// test/helpers/mock-validator.js
export function createMockValidator(name, version, shouldFail = false) {
  return {
    versionCheck: `mock-${name} --version`,
    versionValidate: (result, expected) => {
      if (shouldFail) return false;
      return semver.satisfies(version, expected);
    },
  };
}

export function mockSystemCommands(commands) {
  const mocks = {};
  
  for (const [cmd, output] of Object.entries(commands)) {
    mocks[cmd] = vi.fn().mockResolvedValue(output);
  }
  
  return mocks;
}
```

---

## Coverage Requirements

### Minimum Coverage Thresholds

```javascript
{
  coverage: {
    thresholds: {
      lines: 85,
      functions: 85,
      branches: 80,
      statements: 85,
    },
  },
}
```

### Coverage Reports

Generate multiple report formats:
- **HTML:** For local viewing
- **LCOV:** For CI integration
- **JSON:** For programmatic analysis
- **Text:** For terminal output

### Coverage Badges

Add to README:
```markdown
[![Coverage](https://codecov.io/gh/mohlsen/check-engine/branch/master/graph/badge.svg)](https://codecov.io/gh/mohlsen/check-engine)
```

---

## Continuous Integration

### GitHub Actions Configuration

```yaml
name: Test Suite

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  unit-tests:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [18, 20, 22]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm ci
      - run: npm run test:e2e

  coverage:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm ci
      - run: npm run test:coverage
      
      - name: Upload to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  quality-gate:
    needs: [unit-tests, e2e-tests, coverage]
    runs-on: ubuntu-latest
    
    steps:
      - name: Check all tests passed
        run: echo "All tests passed!"
```

---

## Test Documentation

### Writing Good Tests

**Best Practices:**

1. **Descriptive Names:**
```javascript
// ❌ Bad
it('test 1', () => {});

// ✅ Good
it('should reject version when node is below minimum required', () => {});
```

2. **Arrange-Act-Assert Pattern:**
```javascript
it('should validate correct version', () => {
  // Arrange
  const validator = validatorRules.node;
  const version = 'v20.0.0';
  const requirement = '>=18';
  
  // Act
  const result = validator.versionValidate(version, requirement);
  
  // Assert
  expect(result).toBe(true);
});
```

3. **One Assertion Per Test (Generally):**
```javascript
// ❌ Testing multiple things
it('should work', () => {
  expect(result.status).toBe(0);
  expect(result.message).toBeDefined();
  expect(result.packages.length).toBeGreaterThan(0);
});

// ✅ Focused tests
it('should return success status', () => {
  expect(result.status).toBe(0);
});

it('should include message in result', () => {
  expect(result.message).toBeDefined();
});

it('should include validated packages', () => {
  expect(result.packages.length).toBeGreaterThan(0);
});
```

4. **Test Both Happy and Sad Paths:**
```javascript
describe('checkSystem', () => {
  it('should succeed with valid environment', async () => {
    // ...
  });
  
  it('should fail with invalid environment', async () => {
    // ...
  });
  
  it('should handle missing package.json', async () => {
    // ...
  });
  
  it('should handle corrupted package.json', async () => {
    // ...
  });
});
```

---

## Testing Tools and Utilities

### Recommended Additional Tools

1. **Test Data Generators:**
```bash
npm install -D @faker-js/faker
```

2. **Snapshot Testing:**
```javascript
import { expect, it } from 'vitest';

it('should match snapshot', () => {
  const output = formatOutput(result);
  expect(output).toMatchSnapshot();
});
```

3. **Mock Server (for API testing):**
```bash
npm install -D msw
```

4. **Test Utilities:**
```bash
npm install -D @testing-library/jest-dom
```

---

## Migration Checklist

### Pre-Migration
- [ ] Audit current test coverage
- [ ] Document test dependencies
- [ ] Backup current tests
- [ ] Choose new framework (Vitest recommended)

### Migration Phase
- [ ] Install new testing framework
- [ ] Create configuration files
- [ ] Set up test helpers and utilities
- [ ] Migrate unit tests
- [ ] Migrate integration tests
- [ ] Add E2E tests
- [ ] Set up coverage reporting
- [ ] Update CI/CD pipelines

### Post-Migration
- [ ] Verify all tests passing
- [ ] Check coverage meets thresholds
- [ ] Update documentation
- [ ] Remove old testing dependencies
- [ ] Train team on new framework

---

## Success Criteria

### Test Quality
- ✅ >85% code coverage
- ✅ All tests passing on all platforms
- ✅ Fast test execution (<30s for unit tests)
- ✅ Clear, descriptive test names
- ✅ Good test organization

### Developer Experience
- ✅ Easy to run tests locally
- ✅ Fast feedback in watch mode
- ✅ Clear error messages
- ✅ Easy to write new tests
- ✅ Good documentation

### CI/CD Integration
- ✅ Tests run on every PR
- ✅ Coverage tracked and reported
- ✅ Quality gates enforced
- ✅ Fast CI pipelines (<10 minutes)

---

## Conclusion

Modernizing the testing infrastructure for check-engine will significantly improve code quality, developer experience, and confidence in releases. The recommended migration to Vitest (or Jest) provides:

1. **Better tooling** with modern features
2. **Improved coverage** tracking and reporting
3. **Faster feedback** loops for developers
4. **More comprehensive testing** with unit, integration, and E2E tests
5. **Better CI/CD integration** for automated quality gates

By following this strategy, check-engine will have a robust, maintainable test suite that supports future development and ensures high quality releases.

