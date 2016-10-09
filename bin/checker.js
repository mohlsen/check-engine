#!/usr/bin/env node

'use strict';

const checker = require('../lib/checkSystem.js');
const colors = require('colors');

// set color theme
colors.setTheme({
    success: 'green',
    info: 'grey',
    warn: 'yellow',
    error: 'red',
    boldWarn: ['bold', 'yellow'],
    boldUnderlineSuccess: ['bold', 'underline', 'green'],
    boldUnderlineError: ['bold', 'underline', 'red']
});

console.log('Checking versions...'.info, '\n');

checker().then(result => {
    if (result.status != 0) {
        console.log(colors[result.message.type](result.message.text));
        process.exit(result.status);
    }

    result.packages.forEach(p => {
        console.log(colors[p.type](p.name));
    });

    if (result.message.type === 'success') {
        console.log('\n', result.message.text.boldUnderlineSuccess);
    }
    else {
        console.log('\n', result.message.text.boldUnderlineError);
    }

    process.exit(result.status);
});

// checkerResult.packages.push({
//     message: "✔ " + colors.bold(name) + " was validated with " + engines[name],
//     type: 'sucess'
// });
//
// checkerResult.packages.push({
//     message: colors.bold(name) + " was expected, but no validator found!",
//     type: 'warn'
// });
//
// checkerResult.packages.push({
//     message: "✘ " + colors.bold(name) + " version is incorrect! Expected: " +
//         engines[name] + " but was " + results.reason.trim(),
//     type: 'error'
// });
//
// checkerResult.packages.push({
//     message: "✘ Error validating " + colors.bold(name) + ": " + error.trim(),
//     type: 'error'
// });
