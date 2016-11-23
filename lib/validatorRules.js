"use strict";

module.exports = {
    osx: {
        versionCheck: 'sw_vers -productVersion',
        versionValidate:
            (detectedVersion, expectedVersion) => expectedVersion === detectedVersion.trim()
    },
    node: {
        versionCheck: 'node -v',
        versionValidate:
            (detectedVersion, expectedVersion) =>  'v' + expectedVersion === detectedVersion.trim()
    },
    npm: {
        versionCheck: 'npm -v',
        versionValidate:
            (detectedVersion, expectedVersion) =>  expectedVersion === detectedVersion.trim()
    },
    jx: {
        versionCheck: 'jx -jxv',
        versionValidate:
            (result, version) =>  'v' + version === result.trim()
    },
    cordova: {
        versionCheck: 'cordova -v',
        versionValidate:
            (result, version) =>  version === result.trim()
    },
    appium: {
        versionCheck: 'appium -v',
        versionValidate:
            (result, version) => version === result.trim()
    },
    "ios-deploy": {
        versionCheck: 'ios-deploy -V',
        versionValidate:
            (result, version) => version === result.trim()
    },
    "ios-sim": {
        versionCheck: 'ios-sim --version',
        versionValidate:
            (result, version) => version === result.trim()
    },
    bower: {
        versionCheck: 'bower -v',
        versionValidate:
            (result, version) => version === result.trim()
    },
    "ios-webkit-debug-proxy": {
        versionCheck: 'brew list ios-webkit-debug-proxy --versions',
        versionValidate:
            (result, version) => result.includes(version)

    },
    "ideviceinstaller": {
        versionCheck: 'brew list ideviceinstaller --versions',
        versionValidate:
            (result, version) => result.includes(version)
    },
    java: {
        versionCheck: 'javac -version 2>&1',
        versionValidate:
            (result, version) => result.includes(version)
    },
    ant: {
        versionCheck: 'ant -version',
        versionValidate:
            (result, version) => result.includes(version)
    },
    adb: {
        versionCheck: 'adb version',
        versionValidate:
            (result, version) => result.includes(version)
    },
    git: {
        versionCheck: 'git --version',
        versionValidate:
            (result, version) => {
                // http://stackoverflow.com/questions/82064/a-regex-for-version-number-parsing
                let found = result.match(/(\d+\.)?(\d+\.)?(\d+)/i);
                return found[0] === version;
            }
    },
    windows: {
        versionCheck: 'ver',
        versionValidate:
            (result, version) => result.includes(version)
    }
};
