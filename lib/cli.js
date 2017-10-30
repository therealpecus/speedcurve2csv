#!/usr/bin/env node

/* eslint-disable no-sync, no-process-exit */
var fs = require('fs');
var path = require('path');
var meow = require('meow');
var _ = require('lodash');
var pkg = require('../package.json');
var HELP_FILE_PATH = path.join(__dirname, 'help.txt');
var cli;
var inputFilePath;
var outputFilePath;
var inputFile;
var outputFile;

'use strict';

function parseTests(testFile) {
    var tests = testFile.tests;
    var rows = '';
    var caption = '';

    tests.forEach(function(test) {
        caption = (caption === '') ? Object.keys(test).join(';') : caption;

        for (var prop in test) {
            rows += (typeof(test[prop]) !== 'object') ? test[prop] + ";" : JSON.stringify(test[prop]) + ";"
        }
        rows = rows.substr(0, rows.length -1) + "\n";
    });

    console.log('processed %s test(s)', tests.length);
    return caption + '\n' + rows
}

cli = meow({
    pkg: pkg,
    help: fs.readFileSync(HELP_FILE_PATH, { encoding: 'utf8' }).trim()
}, {
    alias: {
        help: 'h',
        output: 'o',
        version: 'v',
    },
    default: {
        concurrency: 5
    }
});

inputFilePath = path.resolve(cli.input[0]);
if (!fs.existsSync(inputFilePath) || !fs.statSync(inputFilePath).isFile()) {
    console.error('File doesn\'t exist:', inputFilePath);
    process.exit(1);
}

if (_.isString(cli.flags.output)) {
    outputFilePath = path.resolve(cli.flags.output);
} else {
    outputFilePath = inputFilePath.replace('.json', '.csv');
}
inputFile = fs.readFileSync(inputFilePath, { encoding: 'utf8' });
outputFile = parseTests(JSON.parse(inputFile));

fs.writeFileSync(outputFilePath, outputFile);
