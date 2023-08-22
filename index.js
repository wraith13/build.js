'use strict';
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
        !("value" in obj &&
            !(isValidString(obj.value) ||
                isValidArray(obj.value, isValidString)));
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
var isValidPrimeBuildParameters = function (obj) {
    return isValidObject(obj, isValidBuildValue);
};
var isValidBuildPrimeTarget = function (mode) {
    return null !== mode &&
        "object" === typeof mode &&
        !("template" in mode && !isValidBuildValue(mode.template)) &&
        !("output" in mode && !isValidBuildPathValue(mode.output)) &&
        !("parameters" in mode && (!isValidPrimeBuildParameters(mode.parameters) && !isValidBuildJsonValue(mode.parameters)));
};
var isBuildPrimeTarget = function (mode) {
    return isValidBuildPrimeTarget(mode) &&
        "template" in mode &&
        "output" in mode;
};
var isValidBuildProcessTarget = function (mode) {
    return null !== mode &&
        "object" === typeof mode &&
        "processes" in mode && (isValidString(mode.processes) || isValidArray(mode.processes, isValidString));
};
var isValidBuildReferenceTarget = function (mode) {
    return null !== mode &&
        "object" === typeof mode &&
        "references" in mode && isValidString(mode.references);
};
var isValidBuildMetaTarget = function (mode) {
    return null !== mode &&
        "object" === typeof mode &&
        "meta" in mode && isValidBuildTarget(mode.meta) &&
        "parameters" in mode && (isValidArray(mode.parameters, isValidPrimeBuildParameters) || isValidBuildJsonValue(mode.parameters));
};
var isValidBuildTarget = function (mode) {
    return isValidBuildPrimeTarget(mode) ||
        isValidBuildProcessTarget(mode) ||
        isValidBuildReferenceTarget(mode) ||
        isValidBuildMetaTarget(mode);
};
var isValidBuildModeBase = function (mode) {
    return null !== mode &&
        "object" === typeof mode &&
        !("base" in mode && !isValidString(mode.base)) &&
        !("parameters" in mode && (!isValidPrimeBuildParameters(mode.parameters) && !isValidBuildJsonValue(mode.parameters)));
};
var isValidSinglePrimeBuildMode = function (mode) {
    return isValidBuildModeBase(mode) &&
        isValidBuildPrimeTarget(mode);
};
var isValidMultiBuildMode = function (mode) {
    return null !== mode &&
        "object" === typeof mode &&
        "steps" in mode && isValidArray(mode.steps, isValidBuildTarget);
};
var isValidSingleBuildMode = function (mode) {
    return isValidSinglePrimeBuildMode(mode) ||
        isValidBuildProcessTarget(mode) ||
        isValidBuildReferenceTarget(mode) ||
        isValidBuildMetaTarget(mode);
};
var isValidBuildMode = function (mode) {
    return isValidSingleBuildMode(mode) ||
        isValidMultiBuildMode(mode);
};
var isSingleBuildMode = function (mode) { return undefined === mode.steps; };
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
        var current = JSON.parse(fget_1(value.json));
        if (undefined !== value.value) {
            if (Array.isArray(value.value)) {
                value.value.forEach(function (k) { return current = current[k]; });
                current = current;
            }
            else {
                current = current[value.value];
            }
        }
        return current;
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
    var evalParameters_1 = function (parameters) {
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
    var applyParameters_1 = function (text, parameters) {
        return Object.keys(parameters).map(function (key) { return ({ key: key, work: evalValue_1(basePath_1, parameters[key]) }); })
            .reduce(function (r, p) { return "string" === typeof p.work ? r.replace(new RegExp(p.key, "g"), p.work) : r; }, text);
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
        fs_1.writeFileSync(output.path, applyParameters_1(file, parameters));
    };
    var buildTrget_1 = function (target, parameters) {
        var _a;
        if (isBuildPrimeTarget(target)) {
            buildFile_1(target.template, target.output, applyJsonObject_1(simpleDeepCopy(parameters), evalParameters_1((_a = target.parameters) !== null && _a !== void 0 ? _a : {})));
        }
        else if (isValidBuildProcessTarget(target)) {
            (Array.isArray(target.processes) ? target.processes : [target.processes,]).forEach(function (command) {
                console.log("\uD83D\uDC49 ".concat(command));
                child_process_1.execSync(command, {
                    stdio: ["inherit", "inherit", "inherit"]
                });
            });
        }
        else if (isValidBuildReferenceTarget(target)) {
            (Array.isArray(target.references) ? target.references : [target.references,])
                .forEach(function (reference) { return build_1(reference); });
        }
        else if (isValidBuildMetaTarget(target)) {
            var parameters_1 = isValidBuildJsonValue(target.parameters) ?
                evalJsonValue_1(target.parameters) :
                target.parameters;
            if (isValidArray(parameters_1, isValidPrimeBuildParameters)) {
                parameters_1.forEach(function (p) { return build_1(JSON.parse(applyParameters_1(JSON.stringify(target.meta), p))); });
            }
            else {
                console.error("\uD83D\uDEAB invalid meta build parameters: ".concat(JSON.stringify(target)));
                throw new Error();
            }
        }
        else {
            console.error("\uD83D\uDEAB unknown build target: ".concat(JSON.stringify(target)));
            throw new Error();
        }
    };
    var build_1 = function (mode) {
        var _a, _b;
        var json = simpleDeepCopy((_a = master_1.modes.default) !== null && _a !== void 0 ? _a : {});
        var modeJson = master_1.modes[mode];
        if (modeJson) {
            applyJson_1(master_1, json, modeJson);
        }
        else {
            console.error("\uD83D\uDEAB unknown mode: ".concat(JSON.stringify(mode), " in ").concat(JSON.stringify(Object.keys(master_1))));
            throw new Error();
        }
        var parameters = evalParameters_1((_b = json.parameters) !== null && _b !== void 0 ? _b : {});
        if (isSingleBuildMode(json)) {
            buildTrget_1(json, parameters);
        }
        else {
            json.steps.forEach(function (i) { return buildTrget_1(i, parameters); });
        }
    };
    var basePath_1 = jsonPath.replace(/\/[^\/]+$/, "/");
    var master_1 = require(jsonPath);
    if (!isValidBuildJson(master_1)) {
        console.error("\uD83D\uDEAB invalid JSON: ".concat(jsonPath));
        console.error("\uD83D\uDEAB Use this JSON Schema: ".concat(schema));
        throw new Error();
    }
    build_1(mode);
    console.log("\u2705 ".concat(jsonPath, " ").concat(mode, " build end: ").concat(new Date(), " ( ").concat((getBuildTime() / 1000).toLocaleString(), "s )"));
}
catch (error) {
    console.error(error);
    console.log("\uD83D\uDEAB ".concat(jsonPath, " ").concat(mode, " build failed: ").concat(new Date(), " ( ").concat((getBuildTime() / 1000).toLocaleString(), "s )"));
}
//# sourceMappingURL=index.js.map