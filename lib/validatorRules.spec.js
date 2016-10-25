"use strict";

const test = require('tape');
const proxyquire = require('proxyquire');

function setupChecker(packageJSON, resultToReturn) {
    return proxyquire('./checkSystem', {
        child_process : {
            exec: (command, cb) => {
                // call the cb function with an error, but no stderr
                // (error, stdout, stderr)
                cb(0, resultToReturn, undefined);
            }
        },
        jsonfile: { readFileSync: () => packageJSON }
    });
}

test('validatorRules', (t) => {

    t.test('git version (standard)', (t) => {

        const checkSystem = setupChecker({ engines: { git: "1.0.0" } }, "git version 1.0.0");

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'git');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

    t.test('git version (Apple)', (t) => {

        const checkSystem = setupChecker({ engines: { git: "1.0.0" } }, "git version 1.0.0 (Apple Git-66)");

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'git');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

});
