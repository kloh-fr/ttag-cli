"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = void 0;
var gettext_parser_1 = require("gettext-parser");
function serialize(poData, options) {
    return gettext_parser_1.po.compile(poData, options);
}
exports.serialize = serialize;
