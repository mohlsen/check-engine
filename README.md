# check-engine ![Build Status](https://github.com/mohlsen/check-engine/actions/workflows/validation.yml/badge.svg?branch=master)
A utility to check your [package.json engines](https://docs.npmjs.com/files/package.json#engines) in Node.js projects. Inspired by the [Thali Project][thali] in [validateBuildEnvironment.js][thalicode]

## About

### Why
For projects of all sizes, but especially for mid to large size teams, environments get out of sync.  Even slight variations in these build / development environments can kill productivity.  

### What This Does
Validates your system to make sure you have the correct system tools and dependencies installed.  Uses the [engine  object][engines] from a `package.json` located in the current or specified directory to determine what system dependencies
or installed tools validate.

### Supported Dependencies
Currently Supporting:

| Dependencies                         | Semantic Versioning |
|--------------------------------------|:-------------------:|
| OS X (MacOS)                         |                     |
| Node.js                              | :white_check_mark:  |
| npm                                  | :white_check_mark:  |
| jx (JXCore)                          |                     |
| cordova                              |                     |
| appium                               |                     |
| ios-deploy                           |                     |
| ios-sim                              |                     |
| bower                                | :white_check_mark:  |
| ios-webkit-debug-proxy               |                     |
| ideviceinstaller                     |                     |
| java                                 |                     |
| ant                                  |                     |
| git                                  |                     |
| gulp-cli                             |                     |
| [cocoapods][cocoapods]               |                     |
| xcodebuild                           |                     |
| [carthage][carthage]                 |                     |
| [xcpretty][xcpretty]                 |                     |
| [libimobiledevice][libimobiledevice] |                     |
| [deviceconsole][deviceconsole]       |                     |
| [check-engine][check-engine]         |                     |
| [yarn][yarn]                         | :white_check_mark:  |
| [nsp][nsp]                           |                     |
| [pnpm][pnpm]                         | :white_check_mark:  |

See the [validatorRules.js file][validator] file for the full list of things that are supported.

Some dependencies support engines with [Semantic Versioning](https://semver.org/).

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
var checkEngine = require('check-engine');

checkEngine('<path to package.json>').then((result) => {
    if (result.status !== 0) {
        console.log('it failed!');
    } else {
        console.log('it worked!');
    }
}

```

The resolved object contains higher level status, as well as information for individual packages that were validated.  The above example only shows the high level. The object structure for the result object is as follows:

```javascript
{
    status: 0 if successful, -1 otherwise
    message: {
        text: 'overall error description'
        type: 'error' or 'success'
    },
    packages: [
        {
            name: 'name of package',
            type: 'error', 'success', or 'warn',
            validatorFound: true or false,
            expectedVersion: 'version listed in package.json for this package', // exists only if validatorFound is true
            commandError: 'error result from validator process execution', // exists only if error occurred
            foundVersion: 'version number found' // exists only if validatorFound is true and there was no commandError error
        }
    ]
}
```

For example usage of this, see [check-engine.js][check-engine-packages].

## Developing check-engine

### Building and Testing
1. Fork and clone repo then `cd check-engine`.
2. Install ESLint: `npm i -g eslint`.
3. Make changes.
4. Run `npm run lint`.
5. Run `npm test`.
6. Push and send a PR.

### Publishing to NPM and Releasing
1. Update the version by calling `npm version [major, minor, or patch]`.
2. Run `npm publish`.
3. `git push --tags`
4. Create a release for the tag on GitHub and describe changes.


[thali]: http://thaliproject.org/
[thalicode]: https://github.com/thaliproject/Thali_CordovaPlugin/blob/master/thali/install/validateBuildEnvironment.js
[engines]: https://docs.npmjs.com/files/package.json#engines
[validator]: lib/validatorRules.js
[check-engine-packages]: https://github.com/mohlsen/check-engine/blob/master/bin/check-engine.js#L29
[cocoapods]:https://cocoapods.org/
[carthage]:https://github.com/Carthage/Carthage
[xcpretty]:https://github.com/supermarin/xcpretty
[libimobiledevice]:http://www.libimobiledevice.org/
[deviceconsole]:https://github.com/rpetrich/deviceconsole
[check-engine]:https://github.com/mohlsen/check-engine
[yarn]:https://yarnpkg.com/
[nsp]:https://github.com/nodesecurity/nsp
[pnpm]:https://pnpm.io/
