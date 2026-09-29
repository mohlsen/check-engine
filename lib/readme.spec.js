"use strict";

const test = require('tape');
const fs = require('fs');
const path = require('path');
const validatorRules = require('./validatorRules');

test('README', (t) => {

    t.test('documents every validator in the Supported Dependencies table', (t) => {
        const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
        // first cell of each table row, e.g. "| `node` " or "| [`yarn`][yarn] "
        const documentedKeys = readme.split('\n')
            .map((line) => /^\| \[?`([^`]+)`/.exec(line))
            .filter((match) => match)
            .map((match) => match[1]);

        Object.getOwnPropertyNames(validatorRules).forEach((key) => {
            t.ok(documentedKeys.includes(key), `README table lists \`${key}\``);
        });
        t.end();
    });

});
