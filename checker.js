'use strict';

const colors = require('colors');
const exec = require('child_process').exec;
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
    },
    jx: {
        versionCheck: 'jx -jxv',
        versionValidate:
            (result, version) =>  'v' + version === result.trim()
    },
    cordova: {
        versionCheck: 'cordova -v',
        versionValidate:
            (result, version) =>  version === result.trim()
    },
    appium: {
        versionCheck: 'appium -v',
        versionValidate:
            (result, version) => version === result.trim()
    },
    "ios-deploy": {
        versionCheck: 'ios-deploy -V',
        versionValidate:
            (result, version) => version === result.trim()
    },
    "ios-sim": {
        versionCheck: 'ios-sim --version',
        versionValidate:
            (result, version) => version === result.trim()
    },
    bower: {
        versionCheck: 'bower -v',
        versionValidate:
            (result, version) => version === result.trim()
    },
    cordova: {
        versionCheck: 'cordova -v',
        versionValidate:
            (result, version) => version === result.trim()
    }
}

// set theme
colors.setTheme({
    success: 'green',
    info: 'grey',
    warn: 'yellow',
    error: 'red'
});

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
                console.log(colors.warn(colors.bold(name) +
                    " was expected, but no validator found!"))
                environmentValid = false;
                return Promise.resolve();
            }

            //console.log("version " + engines[name]);
            //call the validator and pass in the version we expect
            return execAndCheck(validator, engines[name]).then((result) => {
                console.log(colors.success("✔ " + colors.bold(name) + " was validated with " + engines[name]));
                return Promise.resolve();
            })
            .catch((error) => {
                console.log(colors.error("✘ " + colors.bold(name) + " version is not correct! Expected: " + engines[name] +
                    " but was " + error.trim()));
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
        console.log(colors.success(colors.bold(colors.underline("Environment looks good!"))));
        process.exit(1);
    })
    .catch( () => {
        console.log(colors.error(colors.bold(colors.underline("Environment is invalid!"))));
        process.exit(-1)
    });

function execAndCheck(validator, expectedVersion) {

    let promise = new Promise((resolve, reject) => {

        //console.log("calling " + validator.versionCheck + "expecting: " + expectedVersion);
        exec(validator.versionCheck, (error, stdout, stderr) => {
            //console.log("err: " + error);
            if (error) {
               //console.log("err: " + error);
                error.stderr = stderr;
                error.command = validator.versionCheck;
                reject(stderr);
            }

            //console.log(validator.versionCheck + ", stdout:" + stdout);
            validator.versionValidate(stdout, expectedVersion) ? resolve(true) : reject(stdout);
        });
    });

    return promise;

};
