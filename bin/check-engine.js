#!/usr/bin/env node

'use strict';

const checker = require('../lib/checkSystem.js');
const colors = require('colors');
const yargs = require('yargs/yargs');
const commandLineUsage = require('command-line-usage');

const commandLineOptions = [
    {
        header: 'check-engine',
        content: 'A utility to check your package.json engines in Node.js projects.'
    },
    {
        header: 'Synopsis',
        content: [
            '$ check-engine',
            '$ check-engine <argument> <options>',
            '$ check-engine --help'
        ]
    },
    {
        header: 'Arguments',
        content: [
            { name: 'file', summary: `Optional path to the {italic package.json} file to process. Defaults to 
                                        {italic package.json} file in running directory if not provided.` }
        ]
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'help',
                description: 'Display this usage guide.',
                alias: 'h',
                type: Boolean
            },
            {
                name: 'ignore',
                description: 'Do not end the process with an exit code if there are errors validating packages.',
                type: Boolean
            },
            {
                name: 'version',
                description: 'Display version information.',
                alias: 'v',
                type: Boolean
            }
        ]
    }
];

const usage = commandLineUsage(commandLineOptions);
const argv = yargs(process.argv.slice(2))
    .help(false)
    .alias('v','version')
    .argv;

if (argv.help || argv.h) {
    console.log(usage);
    process.exit(0);
}

const ignoreValidationErrors = argv.ignore;
const fileToParse = argv._[0];

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

checker(fileToParse).then((result) => {
    // check if the process should exit prematurely
    if (result.status !== 0) {
        console.log(colors[result.message.type](result.message.text));
        process.exit(result.status);
    }

    // print out results for each package
    result.packages.forEach((p) => {
        if (p.type === 'success') {
            console.log(('✔ ' + colors.bold(p.name) + ' was validated with ' + p.expectedVersion + '.').success);
        }
        else if (p.type === 'warn') {
            console.log((colors.bold(p.name) + ' was expected, but no validator found!').warn);
        }
        else if (p.type === 'error' && p.commandError) {
            console.log(('✘ Error validating ' + colors.bold(p.name) + ': ' + p.commandError).error);
        }
        else if (p.type === 'error' && !p.commandError) {
            console.log((
                '✘ ' + colors.bold(p.name) +
                ' version is incorrect! Expected ' +
                p.expectedVersion + ' but was ' + p.foundVersion + '.'
            ).error);
        }
    });

    // print out a summary message
    if (result.message.type !== 'success') {
        console.log('\n', result.message.text.boldUnderlineError);

        ignoreValidationErrors === true ? process.exit(0) : process.exit(1);
        
    }

    console.log('\n', result.message.text.boldUnderlineSuccess);
});
