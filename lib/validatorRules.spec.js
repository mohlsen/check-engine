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

    t.test('adb version', (t) => {
        const checkSystem = setupChecker(
            { engines: { adb: "1.0.36" } },
            "Android Debug Bridge version 1.0.36\nRevision 09a0d98bebce-android"
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'adb');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

    t.test('windows version', (t) => {
        const checkSystem = setupChecker(
            { engines: { windows: "10.0.14393" } },
            "Microsoft Windows [Version 10.0.14393]"
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'windows');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

    t.test('gulp-cli version', (t) => {
        const checkSystem = setupChecker(
            { engines: { "gulp-cli": "1.2.2" } },
            "├── gulp-cli@1.2.2"
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'gulp-cli');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

    t.test('cocoapods version', (t) => {
        const checkSystem = setupChecker(
            { engines: { cocoapods: "1.1.1" } },
            "1.1.1"
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'cocoapods');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

    t.test('xcodebuild version', (t) => {
        const checkSystem = setupChecker(
            { engines: { xcodebuild: "8.2.1" } },
            `Xcode 8.2.1
             Build version 8C1002`
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'xcodebuild');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

    t.test('carthage version', (t) => {
        const checkSystem = setupChecker(
            { engines: { carthage: "0.18.1" } },
            '0.18.1'
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'carthage');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

    t.test('xcpretty version', (t) => {
        const checkSystem = setupChecker(
            { engines: { xcpretty: "0.2.4" } },
            '0.2.4'
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'xcpretty');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });
    
    t.test('libimobiledevice version', (t) => {
        const checkSystem = setupChecker(
            { engines: { libimobiledevice: "1.2.0 HEAD-c7f24a9" } },
            'libimobiledevice 1.2.0 HEAD-c7f24a9'
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'libimobiledevice');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

    t.test('deviceconsole version', (t) => {
        const checkSystem = setupChecker(
            { engines: { "deviceconsole": "1.0.1" } },
            '├── deviceconsole@1.0.1'
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'deviceconsole');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });

    t.test('check-engine version', (t) => {
        const checkSystem = setupChecker(
            { engines: { "check-engine": "1.2.0" } },
            '├── check-engine@1.2.0'
        );

        checkSystem().then((result) => {
            t.equal(result.packages[0].name, 'check-engine');
            t.equal(result.packages[0].type, 'success');
            t.equal(result.packages[0].validatorFound, true);
            t.equal(result.packages[0].expectedVersion, result.packages[0].foundVersion);
            t.end();
        });
    });
    
});
