# check-engine  [![Build Status](https://travis-ci.org/mohlsen/check-engine.svg?branch=master)](https://travis-ci.org/mohlsen/check-engine)
A utility to check your engines in a package.json for Node.js. Inspired by the [Thali Project][thali] in [validateBuildEnvironment.js][thalicode]

## About

### Why
For projects of all sizes, but especially for mid to large size teams, evenironemts get out of sync.  Even slight variations in these build / development environments can kill productivity.  

### What This Does
Validates your system to make sure you have the correct system tools and dependencies installed.  Uses the [engine  object][engines] from a `package.json` located in the current or specified directory to determine what system dependencies
or installed tools validate.

### Supported Dependencies
Currently Supporting:
- osx (MacOS)
- node
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

## Usage

### CLI

#### Install
Can be installed globally or in a local directory.

- **Globally**: `npm install -g check-engine`
- **Local**: `npm install check-engine`

#### Running:
1. Run `check-engine [path_to_package.json]`. `check-engine` is located in `bin/check-engine` if using a local install.
 - if specified, [path_to_package.json], is the location of a `package.json` file for check-engine to validate against.
 - if ommitted, will use one in the current working directory.
2. It will parse the package.json and validate that you have the versions installed based on the engines defined.

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
1. Clone repo then `cd check-engine`.
2. Install ESLint: `npm i -g eslint`.
3. Make changes.
4. Run `npm run lint`.
5. Run `npm test`.

[thali]: http://thaliproject.org/
[thalicode]: https://github.com/thaliproject/Thali_CordovaPlugin/blob/vNext_yarong_1028/thali/install/validateBuildEnvironment.js
[engines]: https://docs.npmjs.com/files/package.json#engines
[validator]: lib/validatorRules.js
[check-engine-packages]: https://github.com/mohlsen/check-engine/blob/master/bin/check-engine.js#L29
