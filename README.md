Speedcurve2csv
=====

speedcurve2csv converts SpeedCurve tests data to CSV. If you do not want to dabble with code, you can run analysis on your data with Excel, Google Sheets or any other spreadsheet.

Tests exported from SpeedCurve are in JSON format. A JSON file containing the tests can be piped to speedcurve2csv via stdin, or passed as the first parameter. If no output flag is specified, the CSV is sent to stdout.

speedcurve2csv can also fetch data from SpeedCurve and automate the process of collecting tests and coverting them to CSV. In this case it requires the API key from speedcurve and either the `--listurls` flag (to see all available URLs) or the `--url` flag (to get the actual tests). Note that URLs each API key refers to a different group of URLs and tests on SpeedCurve).
You can save your API key with `--save` to avoid specyfing it at every run.


Getting Started
---------------

Install the Speedcurve2csv command line tool:
```bash
npm install -g speedcurve2csv
```

List all available URLs:
```bash
speedcurve2csv -k myAPIkey --save -l
```

And then get a set of tests:
```bash
speedcurve2csv -k myAPIkey -u URLid
```

Or, pass a JSON file with tests previously downloaded from SpeedCurve APIs:

Also via piping, and to a file:
```bash
cat speedcurve-url-export.json | speedcurve2csv -o speedcurve-url-export.csv
```


Usage
-----

```
Usage: speedcurve2csv <path> [<options>]

Path:
    Path to a file containing the JSON export from a SpeedCurve URL.
    This parameter is ignored when the JSON file is being piped via stdin, e.g. cat speedcurve-export.json | speedcurve2csv


Options:
    -o, --output FILE   File path to output the results of the conversion to
    -k, --apikey API    API key from Speedcurve for the site to fetch, required for --listurls and --url
    -s, --save          Saves the API key. To clear the saved key, pass a new one with -k
    -u, --url NUM       URL id from Speedcurve of the tests to fetch
    -l, --listurls      List all URLs available from Speedcurve
    -d, --days NUM      Number of days of tests to fetch (max 365, default 7)
    -v, --version       Print speedcurve2csv version number
    -h, --help          Show this help text
```


Credits
-------

speedcurve2csv is more than loosely based on medic from Roland Warmerdam [medic]: https://github.com/Rowno/medic


License
-------

Speedcurve2csv is released under the MIT license.
