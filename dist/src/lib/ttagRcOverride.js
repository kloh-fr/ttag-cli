"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTtagRcOpts = void 0;
var fs = require("fs");
function readTtagRC() {
    var opts = {};
    try {
        if (!fs.existsSync(".ttagrc"))
            return opts;
        var jsonRaw = fs.readFileSync(".ttagrc", "utf8");
        var parsedJSON = JSON.parse(jsonRaw);
        if ("extractor" in parsedJSON) {
            opts.extractor = parseExtractor(parsedJSON.extractor);
        }
    }
    catch (err) {
        console.warn(err);
    }
    return opts;
}
function parseExtractor(extractorData) {
    var opts = {};
    if ("paths" in extractorData) {
        opts.paths = parseStringList(extractorData.paths);
    }
    if ("ignoreFiles" in extractorData) {
        opts.ignoreFiles = parseStringList(extractorData.ignoreFiles);
    }
    return opts;
}
function parseStringList(value) {
    return value.split(",").map(function (x) { return x.trim(); });
}
function parseTtagRcOpts() {
    var opts = readTtagRC();
    if (!Object.keys(opts))
        return undefined;
    return opts;
}
exports.parseTtagRcOpts = parseTtagRcOpts;
