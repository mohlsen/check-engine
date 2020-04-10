"use strict";

const test = require('tape');
const proxyquire = require('proxyquire');

function setupChecker(testjson) {
    return proxyquire('./checkSystem', {
        jsonfile: { readFileSync: () => testjson }
    });
}

test('checkSystem', (t) => {

    t.test('does not explode when working with own package.json', (t) => {
        const checkSystem = require('./checkSystem');
        checkSystem().then((result) => {
            t.equal(result.status, 0);
            t.end();
        });
    });

    t.test('throws when no package.json is present', (t) => {
        const checkSystem = proxyquire('./checkSystem', {
            fs: { accessSync: () => { throw new Error('File not found!'); }}
        });
        checkSystem().then((result) => {
            t.equal(result.status, -1);
            t.end();
        });
    });
    //
    t.test('throws when no engines key is present', (t) => {
        const checkSystem = setupChecker({ });

        checkSystem().then((result) => {
            t.equal(result.status, -1);
            t.end();
        });
    });

    t.test('does not throw when engines key exists', (t) => {
        const checkSystem = setupChecker({ engines: { node: '5.10.1' } });

        checkSystem().then((result) => {
            t.equal(result.status, 0);
            t.end();
        });
    });

    t.test('fails when the correct versions are not found', (t) => {
        const checkSystem = setupChecker({
            engines: {
                node: '0',
                npm: '0'
            }
        });

        checkSystem().then((result) => {
            t.equal(result.message.type, 'error');
            t.end();
        });
    });

    t.test('fails if all correct versions are not found', (t) => {
        const checkSystem = setupChecker({
            engines: {
                node: process.version.substring(1), // remove the 'v'
                npm: '0'
            }
        });

        checkSystem().then((result) => {
            t.equal(result.message.type, 'error');
            t.assert(result.packages[1].type, 'error');
            t.assert(result.packages[0].type, 'success');
            t.end();
        });
    });

    t.test('when exec process errors, result package contains correct props', (t) => {

        const testjson = {
            engines: {
                node: process.version
            }
        };

        const checkSystem = proxyquire('./checkSystem', {
            child_process : {
                exec: (command, cb) => {
                    // call the cb function with an error, but no stderr
                    // (error, stdout, stderr)
                    cb(-1, undefined, "");
                }
            },
            jsonfile: { readFileSync: () => testjson }
        });

        checkSystem().then((result) => {
            t.equal(result.message.type, 'error');
            t.equal(result.packages[0].name, 'node');
            t.equal(result.packages[0].type, 'error');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].commandError.toString(), 'Error: -1');
            t.equal(result.packages[0].expectedVersion, process.version);
            t.end();
        });
    });

    t.test('warns for missing validators', (t) => {
        const checkSystem = setupChecker({
            engines: {
                node: process.version.substring(1), // remove the 'v'
                notExistingEngine: '3.9.1'
            }
        });

        checkSystem().then((result) => {
            t.equal(result.message.type, 'error');
            t.assert(result.packages[1].type, 'warn');
            t.assert(result.packages[0].type, 'success');
            t.end();
        });
    });

    t.test('passes if all versions are validated', (t) => {
        const checkSystem = setupChecker({
            engines: {
                node: process.version.substring(1) // remove the 'v'
            }
        });

        checkSystem().then((result) => {
            t.equal(result.message.type, 'success');
            t.assert(result.packages.every((item) => {
                return item.type === 'success';
            }));
            t.end();
        });
    });
});
