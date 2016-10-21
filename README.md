# checker.js

A system version checker in Node.js. Inspired by the [Thali Project][thali] in [validateBuildEnvironment.js][thalicode]

### About

Validates your system to make sure you have the correct system tools and dependencies installed.  Uses the [engine  object][engines] from your `package.json` located in the current directory to determine what system dependencies
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

See the [validatorRules.js file][validator] file for the full list of things that are supported.

### Usage

#### Global Install

1. `npm install -g https://github.com/mohlsen/checker.js.git`
2. Then run `checker.js` in the root of your project.  It will parse your package.json and validate that you have the versions installed.

#### Local Install

1. `npm install https://github.com/mohlsen/checker.js.git` into your project or new location.
2. From any location on your machine that has a `package.json` file in the current directory, run `node <path to checker install>/bin/checker.js`

### Developing checker.js

1. Install ESLint - `npm i -g eslint`
2. Run `npm run lint`
3. Run `npm test`

[thali]: http://thaliproject.org/
[thalicode]: https://github.com/thaliproject/Thali_CordovaPlugin/blob/vNext_yarong_1028/thali/install/validateBuildEnvironment.js
[engines]: https://docs.npmjs.com/files/package.json#engines
[validator]: lib/validatorRules.js
