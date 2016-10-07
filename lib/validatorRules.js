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
        versionCheck: 'ios-webkit-debug-proxy',
        versionValidate:
            (result, version) => version === result.trim()
    }
};
