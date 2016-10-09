'use strict';

let check = function() {

    const path = require("path");
    const exec = require('child_process').exec;
    const Promise = require("bluebird");
    const _ = require("lodash");
    const validaterRules = require('./validatorRules');
    const promiseHelpers = require("./promiseHelpers");
    const fs = require('fs');
    let engines;

    const checkerResult = {
        status: 0,
        message: '',
        packages: []
    };

    const packageJsonPath = path.join(process.cwd(), "package.json");
    try {
        fs.accessSync(packageJsonPath);
        engines = require(packageJsonPath).engines;
    }
    catch (ex) {
        checkerResult.message = {
            text: "✘ No package.json found in the current directory so I can't validate what you need!",
            type: 'error'
        };
        checkerResult.status = -1;

        return Promise.resolve(checkerResult);
    }

    if (!engines) {
        checkerResult.message = {
            text: "✘ No engines found in package.json so I can't validate what you need!",
            type: 'error'
        };
        checkerResult.status = -1;

        return Promise.resolve(checkerResult);
    }

    const thingsToCheck = Object.getOwnPropertyNames(engines);
    const validatorPromises = thingsToCheck.map(validate); // run the function over all items.

    return promiseHelpers.allSettled(validatorPromises)
    .then((inspections) => {
        const environmentIsValid = _.every(inspections,
            (inspection) => inspection.isFulfilled() && inspection.value());

        if (environmentIsValid) {
            checkerResult.message = {
                text: "Environment looks good!",
                type: 'success'
            };
        }
        else {
            checkerResult.message = {
                text: "Environment is invalid!",
                type: 'error'
            };
        }
        return checkerResult;
    });

    function validate(name) {

        // find it in the validators
        const validator = validaterRules[name];

        if (validator === undefined) {
            checkerResult.packages.push({
                name: name,
                validatorFound: false,
                type: 'warn'
            });
            return Promise.resolve(false);
        }

        // call the validator and pass in the version we expect
        return execAndCheck(validator, engines[name]).then((results) => {
            if (results.result) {
                checkerResult.packages.push({
                    name: name,
                    validatorFound: true,
                    expectedVersion: engines[name],
                    foundVersion: engines[name],
                    type: 'success'
                });
            }
            else {
                checkerResult.packages.push({
                    name: name,
                    validatorFound: true,
                    expectedVersion: engines[name],
                    foundVersion: results.reason.trim(),
                    type: 'error'
                });
            }

            return Promise.resolve(results.result);
        })
        .catch((error) => {
            checkerResult.packages.push({
                name: name,
                validatorFound: true,
                commandError: error.trim(),
                type: 'error'
            });
            return Promise.reject();
        });
    }

    function execAndCheck(validator, expectedVersion) {
        let promise = new Promise((resolve, reject) => {
            exec(validator.versionCheck, (error, stdout, stderr) => {

                if (error) {
                    reject(stderr);
                    return;
                }

                resolve({
                    result: validator.versionValidate(stdout, expectedVersion),
                    reason: stdout
                });
            });
        });

        return promise;
    }
};
module.exports = check;
