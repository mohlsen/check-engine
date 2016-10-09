"use strict";

const test = require('tape');
const proxyquire = require('proxyquire');

const MockFile = require('../test/MockFile');

function setupChecker(mocks) {
    return proxyquire('./checkSystem', mocks);
}

test('checkSystem', (t) => {

    t.test('throws when no package.json is present', (t) => {
        const checkSystem = setupChecker({
            fs: {
                accessSync: () => {
                    throw 'File not found!';
                }
            }
        });

        checkSystem().then((result) => {
            t.equal(result.status, -1);
            t.end();
        });
    });

    t.test('throws when no engines key is present', (t) => {
        const checkSystem = setupChecker({
            fs: { accessSync: () => 0 }
        });

        let mf = new MockFile('./testPackage.json', {});

        checkSystem(mf.path).then((result) => {
            t.equal(result.status, -1);

            mf.delete();
            mf = undefined;
            t.end();
        });
    });
});
