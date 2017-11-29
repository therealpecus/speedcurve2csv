#!/usr/bin/env node

/* eslint-disable no-sync, no-process-exit */
'use strict';
var path = require('path');
var fs = require('fs');
var meow = require('meow');
var conf = require('conf');
var stdin = require('get-stdin');
var _ = require('lodash');
var pkg = require('../package.json');
var request = require('request-promise-native');
var chalk = require('chalk');

var HELP_FILE_PATH = path.join(__dirname, 'help.txt');
var cli;
var config;


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

function prettyPrintURLs(speedcurveJson) {
    // console.log('call speedcurve2csv -u with the URL id from the list below');
    speedcurveJson.sites.map( site => {
        console.log(chalk.bold.white.bgGreen(`Listing URLs for : ${site.name}`));
        site.urls.map( url => {
            console.log(`   URL id: ` + chalk.yellow(`${url.url_id}`) + `
    ${url.url} ` + chalk.dim(`(${url.label})`));
        })
    });
}

async function fetchSpeedcurveData(restAPI, apikey) {
    var APIendpoint = 'https://api.speedcurve.com';
    var APIversion = '/v1/';
    var url = APIendpoint + APIversion + restAPI.replace(/^\/(.+)/, '$1')
    var SCrequest = request.defaults({ timeout: 10000 });
    var responseBody;

    // console.log('request: getting', url);

    try {    
        responseBody = await SCrequest.get(url, {
            'auth': {
                'user': apikey,
                'pass': 'x',
                'sendImmediately': true
            }
        });
        // console.log('request: gotten', responseBody);
        return responseBody;
    } catch (err) {
        console.error('ERROR: could not fetch data from SpeedCurve. Check API Key and network.', err);
        process.exit(1);        
    }
}

function composeSpeedcurveUrl() {
    // "https://api.speedcurve.com/v1/urls/536"
    return 'urls/' + cli.flags.url + (cli.flags.days ? '/days=' + cli.flags.days : '');
}

function speedcurve2csv (speedcurveJson) {
    var speedcurveCSV;

    if (speedcurveJson.length) {
        speedcurveCSV = parseTests(JSON.parse(speedcurveJson));

        // If output file was specified, write out
        if (cli.flags.output && _.isString(cli.flags.output)) {
            filepath = path.resolve(cli.flags.output);
            fs.writeFileSync(filepath, speedcurveCSV);
        } else {
            // else print to stdout
            console.log(speedcurveCSV);
        }
    }
}

config = new conf();
cli = meow({
    pkg: pkg,
    help: fs.readFileSync(HELP_FILE_PATH, { encoding: 'utf8' }).trim()
}, {
    alias: {
        help: 'h',
        output: 'o',
        apikey: 'k',
        save: 's',
        url: 'u',
        listurls: 'l',
        days: 'd',
        version: 'v'
    }
});

// console.log(cli.flags);

stdin().then(async function onStdin(stdinSpeedcurveJson) {
    var filepath;
    var speedcurveJson;
    var speedcurveCSV;
    var speedcurveBody;

    // Require stdin or file
    if (!stdinSpeedcurveJson && !cli.input[0]) {

        // Use API key from saved config, update or override
        if (cli.flags.apikey && cli.flags.save) {
            config.set('apikey', cli.flags.apikey);
        }
        cli.flags.apikey = cli.flags.apikey || config.get('apikey');

        // If no API key provided, exit with help
        if (!cli.flags.apikey || !(cli.flags.listurls || cli.flags.url)) {
            console.error(chalk.red('Missing file or params'));
            cli.showHelp();
            process.exit(1);
        } else {
            // If options were passed in, get tests or URLs.
            // requires:
            // api[k]ey && ([u]rl || [u]rl && [d]ays)
            // ||
            // api[k]ey && [l]isturls
            if (cli.flags.listurls) {
                // console.log('list all urls');

                // console.log('getting speedcurve data (urls)');
                var speedcurveBody = await fetchSpeedcurveData('urls', cli.flags.apikey);
                // console.log('got http data', speedcurveBody);
                prettyPrintURLs(JSON.parse(speedcurveBody));
                process.exit();
            } else {
                try {
                    // console.log('getting speedcurve data (tests)', composeSpeedcurveUrl());
                    var speedcurveBody = await fetchSpeedcurveData(composeSpeedcurveUrl(), cli.flags.apikey);
                    // console.log('got http data');
                    speedcurve2csv(speedcurveBody);
                    process.exit();
                } catch(err) {
                    console.error(chalk.red('ERROR: could not fetch data from SpeedCurve. Check API Key and network.', err));
                    process.exit(1);
                }
            }
        }
    }

    // If no stdin, test for file
    if (stdinSpeedcurveJson) {
        speedcurveJson = stdinSpeedcurveJson;
    } else if (cli.input[0]) {
        filepath = path.resolve(cli.input[0]);

        if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
            console.error(chalk.red('File doesn\'t exist:', filepath));
            process.exit(1);
        }
        speedcurveJson = fs.readFileSync(filepath, { encoding: 'utf8' });
    } else {
        cli.showHelp();
        process.exit(1);
    }

});
