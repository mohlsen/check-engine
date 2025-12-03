"use strict";

const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...globals.es2022,
                describe: true,
                it: true,
                jasmine: true,
                beforeEach: true,
                spyOn: true,
                expect: true,
                runs: true,
                waitsFor: true,
                afterEach: true
            }
        },
        rules: {
            "indent": ["error", 4],
            "quotes": ["off"],
            "semi": ["error", "always"],
            "max-len": ["error", 120],
            "one-var": ["error", "never"],
            "require-jsdoc": ["off"],
            "no-var": ["error"],
            "no-multiple-empty-lines": ["error", {
                "max": 5,
                "maxEOF": 1,
                "maxBOF": 1
            }],
            "space-before-function-paren": ["error", {
                "anonymous": "never",
                "named": "never"
            }],
            "spaced-comment": ["error", "always", {
                "line": {
                    "markers": ["/"],
                    "exceptions": ["/"]
                },
                "block": {
                    "markers": ["*"]
                }
            }],
            "padded-blocks": ["off"],
            "brace-style": ["error", "stroustrup", {
                allowSingleLine: true
            }],
            "no-else-return": ["off"],
            "object-curly-spacing": ["off"],
            "arrow-parens": ["error", "always"],
            "no-new-wrappers": ["error"],
            "no-console": ["off"],
            "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }]
        }
    },
    {
        ignores: ["node_modules/**", "coverage/**"]
    }
];
