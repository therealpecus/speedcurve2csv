Speedcurve2csv
=====

Export a CSV file of tests from SpeedCurve APIs.


Getting Started
---------------

Install the Speedcurve2csv command line tool:
```bash
npm install -g speedcurve2csv
```

Download a JSON export from SpeedCurve APIs for a single URL

Run speedcurve2csv:
```bash
speedcurve2csv speedcurve-url-export.json
```


Usage
-----

### CLI

```
Usage: speedcurve2csv <path> [<options>]

Path:
    Path to a file containing the JSON export from a SpeedCurve URL

Options:
    -h, --help        Show this help text.
    -o, --output      File path to output the results of this run to.
    -v, --version     Print medic's version.
```


Credits
-------

speedcurve2csv is more than loosely based on medic from Roland Warmerdam [medic]: https://github.com/Rowno/medic


License
-------

Speedcurve2csv is released under the MIT license.
