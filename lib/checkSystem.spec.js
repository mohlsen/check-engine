"use strict";

const test = require('tape');

const checkSystem = require('./checkSystem');
const MockFile = require('../test/MockFile');

test('checkSystem', (t) => {

    t.test('throws when no package.json is present', (t) => {
        checkSystem('./notarealpackage.json').then((result) => {
            t.equal(result.status, -1);
            t.end();
        });
    });

    t.test('throws when no engines key is present', (t) => {
        let mf = new MockFile('testPackage.json', { foo: 'bar' });

        checkSystem(mf.path).then((result) => {
            t.equal(result.status, -1);

            mf.delete();
            mf = undefined;
            t.end();
        });
    });

    t.test('passes when engines key exists', (t) => {
        let mf = new MockFile('testPackage2.json', {
            engines: { node: '5.10.1' }
        });

        checkSystem(mf.path).then((result) => {
            t.equal(result.status, 0);

            mf.delete();
            mf = undefined;
            t.end();
        });
    });
});
