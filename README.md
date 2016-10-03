# checker.js

A system version checker in Node.js. Inspired by the [Thali Project][thali] in [validateBuildEnvironment.js][thalicode]

### About

Validates your system to make sure you have the correct system tools and dependencies installed.  Uses your package.json's [engine object][engines] to determine what to validate.

### Usage

Not yet build out as a node module.
 - drop checker.js into your project.
 - add the following to your devDependecies:
```
"bluebird": "^3.4.6",
"colors": "^1.1.2"
```

 - run `node checker.js`

It will parse your package json and validate that you have the versions installed.

[thali]: http://thaliproject.org/
[thalicode]: https://github.com/thaliproject/Thali_CordovaPlugin/blob/vNext_yarong_1028/thali/install/validateBuildEnvironment.js
[engines]: https://docs.npmjs.com/files/package.json#engines
