'use strict';

const exec = require('child_process').exec;
const cp = require('child-process-es6-promise');
const engines = require('./package.json').engines;
const validaters =
{
  osx: {
    versionCheck: 'sw_vers -productVersion',
    versionValidate:
      (detectedVersion, expectedVersion) => expectedVersion === detectedVersion.trim()
  },
  node: {
    versionCheck: 'node -v',
    versionValidate:
      (detectedVersion, expectedVersion) =>  'v' + expectedVersion === detectedVersion.trim()
  },
  npm: {
    versionCheck: 'npm -v',
    versionValidate:
      (detectedVersion, expectedVersion) =>  expectedVersion === detectedVersion.trim()
  }
}

if (!engines) {
    console.log("No engines found in package.json");
    process.exit(-1);
}

function runValidations() {
    let environmentValid = true;
    const numberOfValidations = Object.keys(engines).length;
    let validationsComplete = 0;
    let runningPromise = Promise.resolve();

    //iterate over the engines supplied
    Object.getOwnPropertyNames(engines).forEach(function (name) {

        runningPromise = runningPromise.then( () => {

            //find it in the validators
            let validator = validaters[name];

            if (validator === undefined) {
                console.log(name + " was expected, but no validator found!  Aborting validation.")
                process.exit(-1);
            }

            //console.log("version " + engines[name]);
            //call the validator and pass in the version we expect
            return execAndCheck(validator, engines[name]).then((result) => {
                console.log(name + " was validated with " + engines[name]);
                return Promise.resolve();
            })
            .catch((error) => {
                console.log(name + " version is not correct! Expected: " + engines[name] + " but was " + error);
                environmentValid = false;
                return Promise.resolve(error);
            })
        });
    });

    return runningPromise.then( () => {
        return environmentValid ? Promise.resolve() : Promise.reject();
    });
}

runValidations()
    .then( () => {
        console.log("Environment looks good!");
        process.exit(1);
    })
    .catch( () => {
        console.log("Environment is invalid!");
        process.exit(-1)
    });

function execAndCheck(validator, expectedVersion) {

    let promise = new Promise((resolve, reject) => {

        //console.log("calling " + validator.versionCheck + "expecting: " + expectedVersion);
        exec(validator.versionCheck, (error, stdout, stderr) => {
            //console.log("err: " + error);
            if (error) {
                error.stderr = stderr;
                error.command = command;
                return reject(error);
            }

            //console.log(validator.versionCheck + ", stdout:" + stdout);
            validator.versionValidate(stdout, expectedVersion) ? resolve(true) : reject(stdout);
        });
    });

    return promise;

};
