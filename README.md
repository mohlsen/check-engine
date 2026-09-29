# check-engine ![Build Status](https://github.com/mohlsen/check-engine/actions/workflows/validation.yml/badge.svg?branch=master)
A utility to check your [package.json engines](https://docs.npmjs.com/files/package.json#engines) in Node.js projects. Inspired by the [Thali Project][thali] in [validateBuildEnvironment.js][thalicode]

## About

### Why
For projects of all sizes, but especially for mid to large size teams, environments get out of sync.  Even slight variations in these build / development environments can kill productivity.  

### What This Does
Validates your system to make sure you have the correct system tools and dependencies installed.  Uses the [engine  object][engines] from a `package.json` located in the current or specified directory to determine what system dependencies
or installed tools validate.

### Supported Dependencies
Use these keys in your `engines` object. Every validator supports [semver](https://semver.org/) ranges
(`^`, `~`, `>=`, `x`, `*`, `||`); the first version-looking token in the command's output is compared.

| `engines` key                          | Command run                                     |
|----------------------------------------|-------------------------------------------------|
| `osx` (macOS)                          | `sw_vers -productVersion`                       |
| `node`                                 | `node -v`                                       |
| `npm`                                  | `npm -v`                                        |
| `jx` (JXcore)                          | `jx -jxv`                                       |
| `cordova`                              | `cordova -v`                                    |
| `appium`                               | `appium -v`                                     |
| `ios-deploy`                           | `ios-deploy -V`                                 |
| `ios-sim`                              | `ios-sim --version`                             |
| `bower`                                | `bower -v`                                      |
| `ios-webkit-debug-proxy`               | `brew list ios-webkit-debug-proxy --versions`   |
| `ideviceinstaller`                     | `brew list ideviceinstaller --versions`         |
| `java` (JDK)                           | `javac -version 2>&1`                           |
| `ant`                                  | `ant -version`                                  |
| `adb`                                  | `adb version`                                   |
| `git`                                  | `git --version`                                 |
| `windows`                              | `ver`                                           |
| `gulp-cli`                             | `npm list --depth=0 -g \| grep gulp-cli`        |
| [`cocoapods`][cocoapods]               | `pod --version`                                 |
| `xcodebuild`                           | `xcodebuild -version`                           |
| [`carthage`][carthage]                 | `carthage version`                              |
| [`xcpretty`][xcpretty]                 | `xcpretty -v`                                   |
| [`libimobiledevice`][libimobiledevice] | `brew list --versions \| grep libimobiledevice` |
| [`deviceconsole`][deviceconsole]       | `npm list --depth=0 -g \| grep deviceconsole`   |
| [`check-engine`][check-engine]         | `npm list --depth=0 -g \| grep check-engine`    |
| [`yarn`][yarn]                         | `yarn -v`                                       |
| [`nsp`][nsp]                           | `nsp --version`                                 |
| [`pnpm`][pnpm]                         | `pnpm -v`                                       |

See [validatorRules.js][validator] for the source of truth.

Notes:
- Any key in `engines` without a validator is reported as a warning **and** makes the check fail.
- Commands run through your system shell. Rules using `brew` need Homebrew; rules using `| grep` don't work in
  Windows `cmd.exe`; `osx` and `windows` only work on their respective OS.

## Install
check-engine can be installed globally or in a local directory.

- **Globally**: `npm install -g check-engine`
- **Local**: `npm install check-engine`

## Usage

### CLI

Simply run:

`check-engine [path_to_package.json] [options]`

Where:

- `path_to_package.json` is an optional path to a package.json
  file containing a list of [engines](https://docs.npmjs.com/files/package.json#engines)
  to validate.  If omitted, a package.json file will be looked
  for in the current working directory.

and [options]:

- `--ignore`: Ignore package validation errors and do not return an error exit code. Parsing issues or 
  fatal errors will still return a error code.
- `--help`: Display command line options
- `--version`: Display version

**Note:** If check-engine is installed locally and you are not running it
as part of an [npm script](https://docs.npmjs.com/misc/scripts), you will
have to specify the path to the check-engine executable, which will be
`./node_modules/.bin/check-engine`.  Specifying this path is not necessary
within npm scripts, because npm automatically puts the `./node_modules/.bin`
folder into the environment's `PATH`.


### Programmatic
```javascript
const checkEngine = require('check-engine');

checkEngine('<path to package.json>').then((result) => {
    if (result.status !== 0) {
        console.log('could not read package.json or its engines!');
    }
    else if (result.message.type !== 'success') {
        console.log('environment is invalid!');
    }
    else {
        console.log('it worked!');
    }
});
```

The promise always resolves (it does not reject). The resolved object contains a high-level status, as well as
information for individual packages that were validated. The object structure is as follows:

```javascript
{
    status: 0, // -1 only if the package.json could not be read or has no engines; 0 otherwise
               // (including when validation fails - use message.type to detect that)
    message: {
        text: 'overall description',
        type: 'error' or 'success'
    },
    packages: [ // in completion order, not engines order
        {
            name: 'name of package',
            type: 'error', 'success', or 'warn',
            validatorFound: true or false,
            expectedVersion: 'version listed in package.json for this package', // exists only if validatorFound is true
            commandError: 'error result from validator process execution', // exists only if error occurred
            foundVersion: 'version output found' // exists only if validatorFound is true and there was no commandError
        }
    ]
}
```

For example usage of this, see [check-engine.js][check-engine-packages].

## Developing check-engine

### Building and Testing
1. Fork and clone repo then `cd check-engine`.
2. Run `npm ci`.
3. Make changes. To add support for a new tool, see [docs/adding-a-validator.md](docs/adding-a-validator.md).
4. Run `npm run lint`.
5. Run `npm test`.
6. Push and send a PR.

See [AGENTS.md](AGENTS.md) for conventions and [docs/](docs/) for architecture notes and known issues. These are
written for AI coding agents but are equally useful for humans.

### Publishing to NPM and Releasing
1. Update the version by calling `npm version [major, minor, or patch]`.
2. Run `npm publish`.
3. `git push --tags`
4. Create a release for the tag on GitHub and describe changes.


[thali]: http://thaliproject.org/
[thalicode]: https://github.com/thaliproject/Thali_CordovaPlugin/blob/master/thali/install/validateBuildEnvironment.js
[engines]: https://docs.npmjs.com/files/package.json#engines
[validator]: lib/validatorRules.js
[check-engine-packages]: https://github.com/mohlsen/check-engine/blob/master/bin/check-engine.js
[cocoapods]:https://cocoapods.org/
[carthage]:https://github.com/Carthage/Carthage
[xcpretty]:https://github.com/supermarin/xcpretty
[libimobiledevice]:http://www.libimobiledevice.org/
[deviceconsole]:https://github.com/rpetrich/deviceconsole
[check-engine]:https://github.com/mohlsen/check-engine
[yarn]:https://yarnpkg.com/
[nsp]:https://github.com/nodesecurity/nsp
[pnpm]:https://pnpm.io/
