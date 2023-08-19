'use strict';
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJsonableObject = void 0;
var schema = "https://raw.githubusercontent.com/wraith13/build.js/master/json-schema.json#";
var simpleDeepCopy = function (value) { return JSON.parse(JSON.stringify(value)); };
var isValidString = function (obj) { return "string" === typeof obj; };
var isValidArray = function (obj, valueValidator) {
    return "object" === typeof obj &&
        Array.isArray(obj) &&
        0 === obj.filter(function (i) { return !valueValidator(i); }).length;
};
var isValidObject = function (obj, valueValidator) {
    return "object" === typeof obj &&
        !Array.isArray(obj) &&
        0 === Object.keys(obj).filter(function (key) { return !valueValidator(obj[key]); }).length;
};
var isJsonableObject = function (value) {
    return "object" === typeof value && !Array.isArray(value);
};
exports.isJsonableObject = isJsonableObject;
var isValidBuildTextPathValue = function (obj) {
    return "object" === typeof obj &&
        "path" in obj && isValidString(obj.path) &&
        !("replace" in obj &&
            !(("match" in obj.replace && isValidString(obj.replace.match)) &&
                ("text" in obj.replace && isValidBuildValue(obj.replace.text)))) &&
        !("encode" in obj);
};
var isValidBuildBinaryPathValue = function (obj) {
    return "object" === typeof obj &&
        "path" in obj && isValidString(obj.path) &&
        "encode" in obj && isValidString(obj.path) &&
        !("replace" in obj);
};
var isValidBuildPathValue = function (obj) {
    return isValidBuildTextPathValue(obj) || isValidBuildBinaryPathValue(obj);
};
var isValidBuildJsonValue = function (obj) {
    return "object" === typeof obj &&
        "json" in obj && isValidString(obj.json) &&
        !("key" in obj &&
            !(isValidString(obj.key) ||
                isValidArray(obj.key, isValidString)));
};
var isValidBuildCallValue = function (obj) {
    return "object" === typeof obj &&
        "call" in obj && isValidString(obj.call);
};
var isValidBuildResourceValue = function (obj) {
    return "object" === typeof obj &&
        "resource" in obj && isValidString(obj.resource) &&
        !("base" in obj && !isValidString(obj.base));
};
var isValidBuildValue = function (obj) {
    return isValidString(obj) ||
        isValidBuildPathValue(obj) ||
        isValidBuildJsonValue(obj) ||
        isValidBuildCallValue(obj) ||
        isValidBuildResourceValue(obj);
};
var isBuildTextPathValue = isValidBuildTextPathValue;
var isBuildBinaryPathValue = isValidBuildPathValue;
var isBuildJsonValue = isValidBuildJsonValue;
var isBuildCallValue = isValidBuildCallValue;
var isBuildResourceValue = isValidBuildResourceValue;
var isSingleBuildMode = function (mode) { return undefined === mode.files; };
//const isMultiBuildMode = (mode: BuildMode): mode is MultiBuildMode => undefined !== mode.files;
var isValidBuildTarget = function (target) {
    return null !== target &&
        "object" === typeof target &&
        "template" in target && isValidBuildValue(target.template) &&
        "output" in target && isValidBuildPathValue(target.output) &&
        !("parameters" in target && (!isValidObject(target.parameters, isValidBuildValue) && !isValidBuildJsonValue(target.parameters)));
};
var isValidBuildMode = function (mode) {
    return null !== mode &&
        "object" === typeof mode &&
        !("base" in mode && !isValidString(mode.base)) &&
        !("template" in mode && !isValidBuildValue(mode.template)) &&
        !("output" in mode && !isValidBuildPathValue(mode.output)) &&
        !("files" in mode && !(isValidArray(mode.files, isValidBuildTarget) && !("template" in mode) && !("output" in mode))) &&
        !("preprocesses" in mode && !isValidArray(mode.preprocesses, isValidString)) &&
        !("parameters" in mode && (!isValidObject(mode.parameters, isValidBuildValue) && !isValidBuildJsonValue(mode.parameters)));
};
var isValidBuildJson = function (json) {
    return "object" === typeof json &&
        "$schema" in json && "string" === typeof json.$schema && // schema === json.$schema &&
        "modes" in json && isValidObject(json.modes, isValidBuildMode);
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
    var evalJsonValue_1 = function (value) {
        var result = fget_1(value.json);
        if (undefined !== value.key) {
            var current_1 = JSON.parse(result);
            if (Array.isArray(value.key)) {
                value.key.forEach(function (k) { return current_1 = current_1[k]; });
                result = current_1;
            }
            else {
                result = current_1[value.key];
            }
        }
        return result;
    };
    var evalValue_1 = function (basePath, value) {
        if ("string" === typeof value) {
            return value;
        }
        else if (isBuildBinaryPathValue(value)) {
            var result = fs_1.readFileSync(value.path);
            result = result.toString(value.encode);
            return result;
        }
        else if (isBuildTextPathValue(value)) {
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
            return evalJsonValue_1(value);
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
                    return "".concat(startAt);
                case "timestamp_tick":
                    return "".concat(startAt.getTime());
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
    var evalParamets_1 = function (parameters) {
        if (isValidBuildJsonValue(parameters)) {
            return evalJsonValue_1(parameters);
        }
        return parameters;
    };
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
        return target;
    };
    var applyJson_1 = function (master, target, source) {
        var base = source.base;
        if (base) {
            var baseJson = master.modes[base];
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
    var buildFile_1 = function (template, output, parameters) {
        if (!template) {
            console.error("\uD83D\uDEAB no template");
            throw new Error();
        }
        if (!output) {
            console.error("\uD83D\uDEAB no output");
            throw new Error();
        }
        var file = evalValue_1(basePath_1, template);
        // Object.keys(parameters).forEach
        // (
        //     key =>
        //     {
        //         if (file === file.replace(new RegExp(key, "g"), ""))
        //         {
        //             console.error(`🚫 ${key} not found in ${JSON.stringify(template)}.`);
        //             throw new Error();
        //         }
        //     }
        // );
        fs_1.writeFileSync(output.path, Object.keys(parameters).map(function (key) { return ({ key: key, work: evalValue_1(basePath_1, parameters[key]) }); })
            .reduce(function (r, p) { return "string" === typeof p.work ? r.replace(new RegExp(p.key, "g"), p.work) : r; }, file));
    };
    var build = function (json) {
        var _a;
        ((json === null || json === void 0 ? void 0 : json.preprocesses) || []).forEach(function (command) {
            console.log("\uD83D\uDC49 ".concat(command));
            child_process_1.execSync(command, {
                stdio: ["inherit", "inherit", "inherit"]
            });
        });
        if (isSingleBuildMode(json)) {
            buildFile_1(json.template, json.output, evalParamets_1((_a = json.parameters) !== null && _a !== void 0 ? _a : {}));
        }
        else {
            json.files.forEach(function (i) {
                var _a, _b;
                return buildFile_1(i.template, i.output, applyJsonObject_1(simpleDeepCopy(evalParamets_1((_a = json.parameters) !== null && _a !== void 0 ? _a : {})), evalParamets_1((_b = i.parameters) !== null && _b !== void 0 ? _b : {})));
            });
        }
    };
    var basePath_1 = jsonPath.replace(/\/[^\/]+$/, "/");
    var master = require(jsonPath);
    if (!isValidBuildJson(master)) {
        console.error("\uD83D\uDEAB invalid JSON: ".concat(jsonPath));
        console.error("\uD83D\uDEAB Use this JSON Schema: ".concat(schema));
        throw new Error();
    }
    var json = (_a = master.modes.default) !== null && _a !== void 0 ? _a : {};
    var modeJson = master.modes[mode];
    if (modeJson) {
        applyJson_1(master, json, modeJson);
    }
    else {
        console.error("\uD83D\uDEAB unknown mode: ".concat(JSON.stringify(mode), " in ").concat(JSON.stringify(Object.keys(master))));
        throw new Error();
    }
    build(json);
    console.log("\u2705 ".concat(jsonPath, " ").concat(mode, " build end: ").concat(new Date(), " ( ").concat((getBuildTime() / 1000).toLocaleString(), "s )"));
}
catch (error) {
    console.error(error);
    console.log("\uD83D\uDEAB ".concat(jsonPath, " ").concat(mode, " build failed: ").concat(new Date(), " ( ").concat((getBuildTime() / 1000).toLocaleString(), "s )"));
}
//# sourceMappingURL=index.js.map