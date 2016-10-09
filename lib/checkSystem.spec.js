const test = require('tape');
const proxyquire = require('proxyquire');

const checkSystem = proxyquire('./checkSystem', {
    fs: fsStub
});

const fsStub = { };

test('checkSystem', t => {

    function beforeEach() {
        fsStub.accessSync = () => throw new Error('file not found');
    }

    t.test('throws when no package.json is present', t => {
    });

});
