# check-engine  [![Build Status](https://travis-ci.org/mohlsen/check-engine.svg?branch=master)](https://travis-ci.org/mohlsen/check-engine)
A utility to check your [package.json engines](https://docs.npmjs.com/files/package.json#engines) in Node.js projects. Inspired by the [Thali Project][thali] in [validateBuildEnvironment.js][thalicode]

## About

### Why
For projects of all sizes, but especially for mid to large size teams, evenironemts get out of sync.  Even slight variations in these build / development environments can kill productivity.  

### What This Does
Validates your system to make sure you have the correct system tools and dependencies installed.  Uses the [engine  object][engines] from a `package.json` located in the current or specified directory to determine what system dependencies
or installed tools validate.

### Supported Dependencies
Currently Supporting:
- OS X (MacOS)
- Node.js
- npm
- jx (JXCore)
- cordova
- appium
- ios-deploy
- ios-sim
- bower
- ios-webkit-debug-proxy
- ideviceinstaller
- java
- ant
- git

See the [validatorRules.js file][validator] file for the full list of things that are supported.

## Install
check-engine can be installed globally or in a local directory.

- **Globally**: `npm install -g check-engine`
- **Local**: `npm install check-engine`

## Usage

### CLI

Simply run:

`check-engine [path_to_package.json]`

Where:

- `path_to_package.json` is an optional path to a package.json
  file containing a list of [engines](https://docs.npmjs.com/files/package.json#engines)
  to validate.  If omitted, a package.json file will be looked
  for in the current working directory.

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

The result object contains higher level status, as well as information for individual packages that were validated.  The above example only shows the high level. The object structure for the result object is as follows:

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
            expectedVersion: 'version listed in package.json for this package' (exists only if validatorFound is true),
            commandError: 'error result from validator process execution' (exists only if error occurred),
            foundVersion: 'version number found' (exists only if validatorFound is true and there was no commandError error)
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

### Publishing to NPM
1. Update the version by calling `npm version [major, minor, or patch]`.
2. Run `npm publish`.

[thali]: http://thaliproject.org/
[thalicode]: https://github.com/thaliproject/Thali_CordovaPlugin/blob/vNext_yarong_1028/thali/install/validateBuildEnvironment.js
[engines]: https://docs.npmjs.com/files/package.json#engines
[validator]: lib/validatorRules.js
[check-engine-packages]: https://github.com/mohlsen/check-engine/blob/master/bin/check-engine.js#L29
