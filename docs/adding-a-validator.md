# Adding a validator

Adding support for a new tool is the most common contribution. It touches three files.

## 1. Capture real output

Run the tool's version command yourself and copy the **exact** stdout, including banners and extra lines:

```bash
docker --version
# Docker version 27.3.1, build ce12230
```

Things to check:
- Does the command print to **stderr** instead of stdout? Append `2>&1` (see the `java` rule).
- Is the **first** `x.y.z`-looking token the tool's version? `semver.coerce` uses the first match. If a
  different version appears first (API version, runtime version, a date like `2024.01.02`), you need a custom
  `versionValidate` (step 2b).
- Does the command need a pipe (`| grep`)? Pipes don't work on Windows `cmd.exe`. Prefer a command that prints
  only the version.
- Does it prompt, hit the network, or take long? Avoid — the check runs every time.

## 2. Add the rule to `lib/validatorRules.js`

The key is what users will type in `engines`. Use the tool's canonical CLI/package name. Keys with dashes need
quotes. Use double quotes in this file. Append new rules at the end.

### 2a. Standard rule (most tools)

```js
    docker: {
        versionCheck: "docker --version",
        versionValidate
    },
```

### 2b. Custom validator (only when coerce picks the wrong token)

```js
    sometool: {
        versionCheck: "sometool version",
        versionValidate: (result, version) => {
            // e.g. output: "API 1.41\nsometool 3.2.1"
            const match = /sometool (\d+\.\d+\.\d+)/.exec(result);
            return versionValidate(match ? match[1] : "", version);
        }
    },
```

Note that `versionValidate('', range)` throws (coerce returns null), which surfaces as a `commandError`. That
matches existing behavior for "no version found".

## 3. Add tests to `lib/validatorRules.spec.js`

Copy an existing block. Use the real output from step 1 as the canned stdout. At minimum add a passing case;
add a failing/out-of-range case when the output format is unusual.

```js
    t.test('docker version', (t) => {
        const checkSystem = setupChecker(
            { engines: { docker: "27.3.1" } },
            "Docker version 27.3.1, build ce12230"
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'docker');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });
```

(`packages[0]` is safe here because there is only one engine.)

## 4. Document it in `README.md`

Add a row to the "Supported Dependencies" table with the engine key and the command that is run, plus a
link reference at the bottom of the README if the tool has a homepage. `lib/readme.spec.js` fails the build
if a validator key has no table row whose first cell is `` `key` `` or ``[`key`][ref]``.

## 5. Verify

```bash
npm test
npm run lint
```

If the tool is installed locally, also do a real run:

```bash
echo '{"engines":{"docker":">=1"}}' > /tmp/ce-test.json && node bin/check-engine.js /tmp/ce-test.json
```

## Checklist

- [ ] Rule added at end of `lib/validatorRules.js`, key matches what users will write in `engines`
- [ ] Test(s) in `lib/validatorRules.spec.js` using real captured output
- [ ] README table row + link
- [ ] `npm test` and `npm run lint` pass
- [ ] Mentioned any OS/shell limitation in the PR description
