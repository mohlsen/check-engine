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

let environmentValid = true;

if (!engines) {
    console.log("No engines found in package.json");
    process.exit(-1);
}


let overallPromise = new Promise((resolve, reject) => {

    const numberOfValidations = Object.keys(engines).length;
    let validationsComplete = 0;

    //iterate over the engines supplied
    Object.getOwnPropertyNames(engines).forEach(function (name) {

        //find it in the validators
        let validator = validaters[name];

        if (validator === undefined) {
            console.log(name + " was expected, but no validator found!  Aborting validation.")
            process.exit(-1);
        }

        //console.log("version " + engines[name]);
        //call the validator and pass in the version we expect
        execAndCheck(validator, engines[name]).then((result) => {
            console.log(name + " was validated with " + engines[name]);
            validationsComplete++;
        })
        .catch((error) => {
            console.log(name + " version is not correct! Expected: " + engines[name] + " but was " + error);
            environmentValid = false;
            validationsComplete++;
        })

    });

    // while (validationsComplete != numberOfValidations) {
    //     //if (validationsComplete >= numberOfValidations) {
    //         if (environmentValid) {
    //
    //             resolve();
    //         } else {
    //             reject();
    //         }
    //     //}
    // }




});

overallPromise
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


//console.log("Validating package.json engines");

//console.log(engines);
