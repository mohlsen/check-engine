"use strict";

const semver = require("semver");

function versionValidate(result, version) {
    return semver.satisfies(semver.coerce(result).version, version);
}

module.exports = {
    osx: {
        versionCheck: "sw_vers -productVersion",
        versionValidate
    },
    node: {
        versionCheck: "node -v",
        versionValidate
    },
    npm: {
        versionCheck: "npm -v",
        versionValidate
    },
    jx: {
        versionCheck: "jx -jxv",
        versionValidate
    },
    cordova: {
        versionCheck: "cordova -v",
        versionValidate
    },
    appium: {
        versionCheck: "appium -v",
        versionValidate
    },
    "ios-deploy": {
        versionCheck: "ios-deploy -V",
        versionValidate
    },
    "ios-sim": {
        versionCheck: "ios-sim --version",
        versionValidate
    },
    bower: {
        versionCheck: "bower -v",
        versionValidate
    },
    "ios-webkit-debug-proxy": {
        versionCheck: "brew list ios-webkit-debug-proxy --versions",
        versionValidate

    },
    ideviceinstaller: {
        versionCheck: "brew list ideviceinstaller --versions",
        versionValidate
    },
    java: {
        versionCheck: "javac -version 2>&1",
        versionValidate
    },
    ant: {
        versionCheck: "ant -version",
        versionValidate
    },
    adb: {
        versionCheck: "adb version",
        versionValidate
    },
    git: {
        versionCheck: "git --version",
        versionValidate
    },
    windows: {
        versionCheck: "ver",
        versionValidate
    },
    "gulp-cli": {
        versionCheck: "npm list --depth=0 -g | grep gulp-cli",
        versionValidate
    },
    cocoapods: {
        versionCheck: "pod --version",
        versionValidate
    },
    xcodebuild: {
        versionCheck: "xcodebuild -version",
        versionValidate
    },
    carthage: {
        versionCheck: "carthage version",
        versionValidate
    },
    xcpretty: {
        versionCheck: "xcpretty -v",
        versionValidate
    },
    libimobiledevice: {
        versionCheck: "brew list --versions | grep libimobiledevice",
        versionValidate
    },
    deviceconsole: {
        versionCheck: "npm list --depth=0 -g | grep deviceconsole",
        versionValidate
    },
    "check-engine": {
        versionCheck: "npm list --depth=0 -g | grep check-engine",
        versionValidate
    },
    yarn: {
        versionCheck: "yarn -v",
        versionValidate
    },
    nsp: {
        versionCheck: "nsp --version",
        versionValidate
    },
    pnpm: {
        versionCheck: "pnpm -v",
        versionValidate
    },
};
