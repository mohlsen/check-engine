"use strict";

const test = require('tape');
// const _ = require('lodash');
const proxyquire = require('proxyquire');

// function setupChecker(testjson) {
//     return proxyquire('./checkSystem', {
//         jsonfile: { readFileSync: () => testjson }
//     });
// }

test('checkSystem', (t) => {

    t.test('throws when no package.json is present', (t) => {
        const checkSystem = proxyquire('./checkSystem', {
            fs: { accessSync: () => { throw new Error('File not found!'); }}
        });
        checkSystem('./notarealpackage.json').then((result) => {
            console.log(result);
            t.equal(result.status, -1);
            t.end();
        });
    });

    // t.test('throws when no engines key is present', (t) => {
    //     let mf = new MockFile('testPackage.json', { foo: 'bar' });
    //
    //     checkSystem(mf.path).then((result) => {
    //         t.equal(result.status, -1);
    //
    //         mf.delete();
    //         mf = undefined;
    //         t.end();
    //     });
    // });
    //
    // t.test('does not throw when engines key exists', (t) => {
    //     let mf = new MockFile('testPackage2.json', {
    //         engines: { node: '5.10.1' }
    //     });
    //
    //     checkSystem(mf.path).then((result) => {
    //         t.equal(result.status, 0);
    //
    //         mf.delete();
    //         mf = undefined;
    //         t.end();
    //     });
    // });
    //
    // t.test('fails when the correct versions are not found', (t) => {
    //     let mf = new MockFile('testPackage3.json', {
    //         engines: {
    //             node: '0',
    //             npm: '0'
    //         }
    //     });
    //
    //     checkSystem(mf.path).then((result) => {
    //         t.equal(result.message.type, 'error');
    //
    //         mf.delete();
    //         mf = undefined;
    //         t.end();
    //     });
    // });
    //
    // t.test('fails if all correct versions are not found', (t) => {
    //     let mf = new MockFile('testPackage4.json', {
    //         engines: {
    //             node: process.version.substring(1), // remove the 'v'
    //             npm: '0'
    //         }
    //     });
    //
    //     checkSystem(mf.path).then((result) => {
    //         t.equal(result.message.type, 'error');
    //         t.assert(_.some(result.packages, ['type', 'success']));
    //
    //         mf.delete();
    //         mf = undefined;
    //         t.end();
    //     });
    // });
    //
    // t.test('warns for missing validators', (t) => {
    //     let mf = new MockFile('testPackage5.json', {
    //         engines: {
    //             node: process.version.substring(1), // remove the 'v'
    //             gulp: '3.9.1'
    //         }
    //     });
    //
    //     checkSystem(mf.path).then((result) => {
    //         t.equal(result.message.type, 'error');
    //         t.assert(_.some(result.packages, ['type', 'success']));
    //         t.assert(_.some(result.packages, ['type', 'warn']));
    //
    //         mf.delete();
    //         mf = undefined;
    //         t.end();
    //     });
    // });
    //
    // t.test('passes if all versions are validated', (t) => {
    //     let mf = new MockFile('testPackage6.json', {
    //         engines: {
    //             node: process.version.substring(1) // remove the 'v'
    //         }
    //     });
    //
    //     checkSystem(mf.path).then((result) => {
    //         t.equal(result.message.type, 'success');
    //         t.assert(_.every(result.packages, ['type', 'success']));
    //
    //         mf.delete();
    //         mf = undefined;
    //         t.end();
    //     });
    // });
    //
    // t.test('does not explode when working with own package.json', (t) => {
    //     checkSystem().then((result) => {
    //         t.equal(result.status, 0);
    //
    //         t.end();
    //     });
    // });
});
