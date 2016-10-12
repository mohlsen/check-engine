"use strict";

const test = require('tape');
const _ = require('lodash');
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
            t.assert(_.some(result.packages, ['type', 'success']));
            t.end();
        });
    });

    t.test('warns for missing validators', (t) => {
        const checkSystem = setupChecker({
            engines: {
                node: process.version.substring(1), // remove the 'v'
                gulp: '3.9.1'
            }
        });

        checkSystem().then((result) => {
            t.equal(result.message.type, 'error');
            t.assert(_.some(result.packages, ['type', 'success']));
            t.assert(_.some(result.packages, ['type', 'warn']));
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
            t.assert(_.every(result.packages, ['type', 'success']));
            t.end();
        });
    });
});
