"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAll = void 0;
require("../declarations");
var babel = require("@babel/core");
var fs = require("fs");
var tmp = require("tmp");
var path_1 = require("path");
var vue_sfc_parser_1 = require("vue-sfc-parser");
var estree_walker_1 = require("estree-walker");
var compiler_1 = require("svelte/compiler");
var ignore_1 = require("ignore");
var defaults_1 = require("../defaults");
var pathsWalk_1 = require("./pathsWalk");
var ttagPluginOverride_1 = require("./ttagPluginOverride");
function extractAll(paths, lang, progress, overrideOpts, rcOpts) {
    return __awaiter(this, void 0, void 0, function () {
        var tmpFile, ttagOpts, babelOptions, transformFn, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tmpFile = tmp.fileSync();
                    ttagOpts = {
                        extract: { output: tmpFile.name },
                        sortByMsgid: overrideOpts && overrideOpts.sortByMsgid,
                        addComments: true
                    };
                    if (lang !== "en") {
                        ttagOpts.defaultLang = lang;
                    }
                    if (overrideOpts) {
                        ttagOpts = ttagPluginOverride_1.mergeOpts(ttagOpts, overrideOpts);
                    }
                    babelOptions = defaults_1.makeBabelConf(ttagOpts);
                    transformFn = function (filepath) {
                        try {
                            switch (path_1.extname(filepath)) {
                                case ".vue": {
                                    var source = fs.readFileSync(filepath).toString();
                                    var script = vue_sfc_parser_1.parseComponent(source).script;
                                    if (script) {
                                        var lineCount = source.slice(0, script.start).split(/\r\n|\r|\n/)
                                            .length - 1;
                                        babel.transformSync("\n".repeat(lineCount) + script.content, __assign({ filename: filepath }, babelOptions));
                                    }
                                    break;
                                }
                                case ".svelte": {
                                    var source_1 = fs.readFileSync(filepath).toString();
                                    var jsCodes_1 = [];
                                    var _a = compiler_1.parse(source_1), html = _a.html, instance = _a.instance, module_1 = _a.module;
                                    // <script> tag should include `import { t } from 'ttag'`
                                    // We put this in the front.
                                    // FIXME: Because we need to put imports first,
                                    // the extracted line numbers will be messed up.
                                    //
                                    if (module_1) {
                                        estree_walker_1.walk(module_1, {
                                            enter: function (node) {
                                                if (node.type !== "Program")
                                                    return;
                                                jsCodes_1.push(source_1.slice(node.start, node.end));
                                            }
                                        });
                                    }
                                    estree_walker_1.walk(instance, {
                                        enter: function (node) {
                                            if (node.type !== "Program")
                                                return;
                                            jsCodes_1.push(source_1.slice(node.start, node.end));
                                        }
                                    });
                                    // Collect t`...` in {...} in template
                                    estree_walker_1.walk(html, {
                                        enter: function (node) {
                                            if (node.type !== "MustacheTag" &&
                                                node.type !== "RawMustacheTag")
                                                return;
                                            // Attributes can be any valid Javascript expression,
                                            // thus wrap in `(...);` and collect them in `jsCodes`
                                            jsCodes_1.push("(" + source_1.slice(node.expression.start, node.expression.end) + ");");
                                        }
                                    });
                                    babel.transformSync(jsCodes_1.join("\n"), __assign({ filename: filepath }, babelOptions));
                                    break;
                                }
                                default:
                                    babel.transformFileSync(filepath, babelOptions);
                            }
                        }
                        catch (err) {
                            if (err.codeFrame) {
                                console.error(err.codeFrame);
                            }
                            else {
                                console.error(err);
                            }
                            progress.fail("Failed to extract translations");
                            process.exit(1);
                            return;
                        }
                    };
                    return [4 /*yield*/, pathsWalk_1.pathsWalk(getWalkingPaths(paths, rcOpts), progress, decorateTransformFn(transformFn, rcOpts))];
                case 1:
                    _a.sent();
                    result = fs.readFileSync(tmpFile.name).toString();
                    tmpFile.removeCallback();
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.extractAll = extractAll;
function getWalkingPaths(originPaths, rcOpts) {
    var _a;
    return ((_a = rcOpts === null || rcOpts === void 0 ? void 0 : rcOpts.extractor) === null || _a === void 0 ? void 0 : _a.paths) || originPaths;
}
function decorateTransformFn(originFunc, rcOpts) {
    var _a;
    var ignoreFiles = (_a = rcOpts === null || rcOpts === void 0 ? void 0 : rcOpts.extractor) === null || _a === void 0 ? void 0 : _a.ignoreFiles;
    if (ignoreFiles) {
        var ig_1 = ignore_1.default().add(ignoreFiles);
        return function (filename) {
            if (ig_1.ignores(filename) === false) {
                originFunc(filename);
            }
        };
    }
    return originFunc;
}
