'use strict';
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJsonableObject = void 0;
var isJsonableObject = function (value) {
    return "object" === typeof value && !Array.isArray(value);
};
exports.isJsonableObject = isJsonableObject;
var isBuildPathValue = function (value) {
    return "object" === typeof value &&
        "string" === typeof value.path;
};
var isBuildJsonValue = function (value) {
    return "object" === typeof value &&
        "string" === typeof value.json;
};
var isBuildCallValue = function (value) {
    return "object" === typeof value &&
        "string" === typeof value.call;
};
var isBuildResourceValue = function (value) {
    return "object" === typeof value &&
        "string" === typeof value.resource;
};
var startAt = new Date();
var getBuildTime = function () { return new Date().getTime() - startAt.getTime(); };
var jsonPath = process.argv[2];
var mode = process.argv[3] || "default";
console.log("\uD83D\uDE80 ".concat(jsonPath, " ").concat(mode, " build start: ").concat(startAt));
try {
    var process_1 = require("process");
    var child_process_1 = require("child_process");
    var fs_1 = require("fs");
    var makePath_1 = function () {
        var path = [];
        for (var _a = 0; _a < arguments.length; _a++) {
            path[_a] = arguments[_a];
        }
        return path.map(function (i) { return undefined !== i ? i : ""; }).join("").replace(/\/\.\//gm, "/");
    };
    var fget_1 = function (path) { return fs_1.readFileSync(path, { encoding: "utf-8" }); };
    var evalValue_1 = function (basePath, value) {
        if ("string" === typeof value) {
            return value;
        }
        else if (isBuildPathValue(value)) {
            var result_1 = fget_1(value.path);
            if (value.replace) {
                if (Array.isArray(value.replace)) {
                    value.replace.forEach(function (replace) { return result_1 = result_1.replace(new RegExp(replace.match, "gmu"), evalValue_1(basePath, replace.text)); });
                }
                else {
                    result_1 = result_1.replace(new RegExp(value.replace.match, "gmu"), evalValue_1(basePath, value.replace.text));
                }
            }
            return result_1;
        }
        else if (isBuildJsonValue(value)) {
            var result = fget_1(value.json);
            if (undefined !== value.key) {
                var current_1 = JSON.parse(result);
                if (Array.isArray(value.key)) {
                    value.key.forEach(function (k) { return current_1 = current_1[k]; });
                    result = "".concat(current_1);
                }
                else {
                    result = "".concat(current_1[value.key]);
                }
            }
            return result;
        }
        else if (isBuildResourceValue(value)) {
            var resource_1 = require(makePath_1(basePath, value.resource));
            return Object.keys(resource_1)
                .map(function (id) { return "<div id=\"".concat(id, "\">").concat(fget_1(makePath_1(value.base, resource_1[id])).replace(/[\w\W]*(<svg)/g, "$1"), "</div>"); })
                .join("");
        }
        else if (isBuildCallValue(value)) {
            switch (value.call) {
                case "command":
                    return process_1.argv.join(" ");
                case "command_options":
                    return process_1.argv.filter(function (_i, index) { return 2 <= index; }).join(" ");
                case "timestamp":
                    return "".concat(new Date());
                case "timestamp_tick":
                    return "".concat(new Date().getTime());
                default:
                    console.error("\uD83D\uDEAB unknown call: ".concat(JSON.stringify(value)));
                    throw new Error();
            }
        }
        else {
            console.error("\uD83D\uDEAB unknown parameter: ".concat(JSON.stringify(value)));
            throw new Error();
        }
        return null;
    };
    var basePath_1 = jsonPath.replace(/\/[^\/]+$/, "/");
    var master = require(jsonPath);
    var json_1 = (_a = master.default) !== null && _a !== void 0 ? _a : {};
    var modeJson = master[mode];
    var applyJsonObject_1 = function (target, source) {
        Object.keys(source).forEach(function (key) {
            var targetValue = target[key];
            var sourceValue = source[key];
            if ((0, exports.isJsonableObject)(targetValue) && (0, exports.isJsonableObject)(sourceValue)) {
                applyJsonObject_1(targetValue, sourceValue);
            }
            else {
                target[key] = source[key];
            }
        });
    };
    var applyJson_1 = function (master, target, source) {
        var base = source.base;
        if (base) {
            var baseJson = master[base];
            if (baseJson) {
                applyJson_1(master, target, baseJson);
            }
            else {
                console.error("\uD83D\uDEAB unknown base mode: ".concat(JSON.stringify(base), " in ").concat(JSON.stringify(Object.keys(master))));
                throw new Error();
            }
        }
        applyJsonObject_1(target, source);
    };
    if (modeJson) {
        applyJson_1(master, json_1, modeJson);
    }
    else {
        console.error("\uD83D\uDEAB unknown mode: ".concat(JSON.stringify(mode), " in ").concat(JSON.stringify(Object.keys(master))));
        throw new Error();
    }
    ((json_1 === null || json_1 === void 0 ? void 0 : json_1.preprocesses) || []).forEach(function (command) {
        console.log("\uD83D\uDC49 ".concat(command));
        child_process_1.execSync(command, {
            stdio: ["inherit", "inherit", "inherit"]
        });
    });
    if (!json_1.template) {
        console.error("\uD83D\uDEAB no template");
        throw new Error();
    }
    var template_1 = evalValue_1(basePath_1, json_1.template);
    var parameters_1 = json_1.parameters || {};
    Object.keys(parameters_1).forEach(function (key) {
        if (template_1 === template_1.replace(new RegExp(key, "g"), "")) {
            console.error("\uD83D\uDEAB ".concat(key, " not found in ").concat(JSON.stringify(json_1.template), "."));
            throw new Error();
        }
    });
    if (!json_1.output) {
        console.error("\uD83D\uDEAB no output");
        throw new Error();
    }
    fs_1.writeFileSync(json_1.output.path, Object.keys(parameters_1).map(function (key) { return ({ key: key, work: evalValue_1(basePath_1, parameters_1[key]) }); })
        .reduce(function (r, p) { return "string" === typeof p.work ? r.replace(new RegExp(p.key, "g"), p.work) : r; }, template_1));
    console.log("\u2705 ".concat(jsonPath, " ").concat(mode, " build end: ").concat(new Date(), " ( ").concat((getBuildTime() / 1000).toLocaleString(), "s )"));
}
catch (_b) {
    console.log("\uD83D\uDEAB ".concat(jsonPath, " ").concat(mode, " build failed: ").concat(new Date(), " ( ").concat((getBuildTime() / 1000).toLocaleString(), "s )"));
}
//# sourceMappingURL=index.js.map