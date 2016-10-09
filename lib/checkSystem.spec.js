const test = require('tape');
const proxyquire = require('proxyquire');

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
});
