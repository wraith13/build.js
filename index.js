"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJsonableObject = void 0;
var type_1 = require("./generated/type");
var schema = "https://raw.githubusercontent.com/wraith13/build.js/master/json-schema.json#";
var simpleDeepCopy = function (value) { return JSON.parse(JSON.stringify(value)); };
var isJsonableObject = function (value) {
    return "object" === typeof value && !Array.isArray(value);
};
exports.isJsonableObject = isJsonableObject;
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
            }
            else {
                current = current[value.value];
            }
        }
        if ("string" === typeof current) {
            return current;
        }
        else {
            var base = simpleDeepCopy(value);
            delete base.json;
            delete base.value;
            return applyJsonObject_1(base, current);
        }
    };
    var evalValue_1 = function (basePath, value) {
        if ("string" === typeof value) {
            return value;
        }
        else if (type_1.Type.isBinaryPathValue(value)) {
            var result = fs_1.readFileSync(value.path);
            result = result.toString(value.encode);
            return result;
        }
        else if (type_1.Type.isTextPathValue(value)) {
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
        else if (type_1.Type.isJsonValue(value)) {
            return evalJsonValue_1(value);
        }
        else if (type_1.Type.isResourceValue(value)) {
            var resource_1 = require(makePath_1(basePath, value.resource));
            return Object.keys(resource_1)
                .map(function (id) { return "<div id=\"".concat(id, "\">").concat(fget_1(makePath_1(value.base, resource_1[id])).replace(/[\w\W]*(<svg)/g, "$1"), "</div>"); })
                .join("");
        }
        else if (type_1.Type.isCallValue(value)) {
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
        if (type_1.Type.isJsonValue(parameters)) {
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
        if (type_1.Type.isBuildPrimeTarget(target)) {
            buildFile_1(target.template, target.output, applyJsonObject_1(simpleDeepCopy(parameters), evalParameters_1((_a = target.parameters) !== null && _a !== void 0 ? _a : {})));
        }
        else if (type_1.Type.isBuildProcessTarget(target)) {
            (Array.isArray(target.processes) ? target.processes : [target.processes,]).forEach(function (command) {
                console.log("\uD83D\uDC49 ".concat(command));
                child_process_1.execSync(command, {
                    stdio: ["inherit", "inherit", "inherit"]
                });
            });
        }
        else if (type_1.Type.isBuildReferenceTarget(target)) {
            (Array.isArray(target.references) ? target.references : [target.references,])
                .forEach(function (reference) { return build_1(reference); });
        }
        else if (type_1.Type.isBuildMetaTarget(target)) {
            var parameters_1 = type_1.Type.isJsonValue(target.parameters) ?
                evalJsonValue_1(target.parameters) :
                target.parameters;
            //if (isValidArray(parameters, isValidPrimeBuildParameters))
            if (type_1.EvilType.Validator.isArray(type_1.EvilType.Validator.isDictionaryObject(type_1.Type.isValueType))(parameters_1)) {
                parameters_1.forEach(function (p) {
                    var _a, _b, _c;
                    var json = JSON.parse(applyParameters_1(JSON.stringify(target.meta), p));
                    if (type_1.Type.isBuildTarget(json)) {
                        var parameters_2 = evalParameters_1(applyJsonObject_1(simpleDeepCopy((_b = (_a = master_1.modes.default) === null || _a === void 0 ? void 0 : _a.parameters) !== null && _b !== void 0 ? _b : {}), ((_c = json.parameters) !== null && _c !== void 0 ? _c : {})));
                        buildTrget_1(json, parameters_2);
                    }
                    else {
                        console.error("\uD83D\uDEAB unknown build target(meta): ".concat(JSON.stringify(json)));
                    }
                });
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
        if (type_1.Type.isMultiMode(json)) {
            json.steps.forEach(function (i) { return buildTrget_1(i, parameters); });
        }
        else if (type_1.Type.isSingleMode(json)) {
            buildTrget_1(json, parameters);
        }
        else {
            var listner_1 = type_1.EvilType.Error.makeListener(mode);
            type_1.EvilType.Validator.isOr(type_1.Type.isSingleMode, type_1.Type.isMultiMode)(json, listner_1);
            console.error(listner_1.errors);
            console.error("\uD83D\uDEAB unknown mode type: ".concat(JSON.stringify(mode), " in ").concat(JSON.stringify(json)));
            throw new Error();
        }
    };
    var basePath_1 = jsonPath.replace(/\/[^\/]+$/, "/");
    var master_1 = require(jsonPath);
    var listner = type_1.EvilType.Error.makeListener(jsonPath);
    if (!type_1.Type.isRoot(master_1, listner)) {
        console.error("\uD83D\uDEAB invalid JSON: ".concat(jsonPath));
        console.error("\uD83D\uDEAB Use this JSON Schema: ".concat(schema));
        console.error(listner.errors);
        throw new Error();
    }
    build_1(mode);
    console.log("\u2705 ".concat(jsonPath, " ").concat(mode, " build end: ").concat(new Date(), " ( ").concat((getBuildTime() / 1000).toLocaleString(), "s )"));
}
catch (error) {
    console.error(error);
    console.log("\uD83D\uDEAB ".concat(jsonPath, " ").concat(mode, " build failed: ").concat(new Date(), " ( ").concat((getBuildTime() / 1000).toLocaleString(), "s )"));
}
// how to run: `node ./index.js BUILD-JSON-PATH BUILD-MODE`
//# sourceMappingURL=index.js.map