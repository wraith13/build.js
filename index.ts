'use strict';
const schema = "https://raw.githubusercontent.com/wraith13/build.js/master/json-schema.json#";
const simpleDeepCopy = <ValueType>(value: ValueType): ValueType => <ValueType>JSON.parse(JSON.stringify(value));
const isValidString = (obj: any): obj is string => "string" === typeof obj;
const isValidArray = <ValueType>(obj: any, valueValidator: (value: any) => value is ValueType): obj is ValueType[] =>
    "object" === typeof obj &&
    Array.isArray(obj) &&
    0 === obj.filter(i => ! valueValidator(i)).length;
const isValidObject = <ValueType>(obj: any, valueValidator: (value: any) => value is ValueType): obj is { [key: string]: ValueType } =>
    "object" === typeof obj &&
    ! Array.isArray(obj) &&
    0 === Object.keys(obj).filter(key => ! valueValidator(obj[key])).length;
export type JsonableValue = null | boolean | number | string;
export interface JsonableObject
{
    [key: string]: undefined | Jsonable;
}
export type Jsonable = JsonableValue | Jsonable[] | JsonableObject;
export const isJsonableObject = (value: Jsonable | undefined): value is JsonableObject =>
    "object" === typeof value && ! Array.isArray(value);
interface BuildTextPathValue extends JsonableObject
{
    path: string;
    replace?:
    {
        match: string;
        text: BuildValueType;
    };
}
const isValidBuildTextPathValue = (obj: any): obj is BuildTextPathValue =>
    "object" === typeof obj &&
    "path" in obj && isValidString(obj.path) &&
    !
    (
        "replace" in obj &&
        !
        (
            ("match" in obj.replace && isValidString(obj.replace.match)) &&
            ("text" in obj.replace && isValidBuildValue(obj.replace.text))
        )
    ) &&
    ! ("encode" in obj);
interface BuildBinaryPathValue extends JsonableObject
{
    path: string;
    encode: "base64",
}
const isValidBuildBinaryPathValue = (obj: any): obj is BuildPathValue =>
    "object" === typeof obj &&
    "path" in obj && isValidString(obj.path) &&
    "encode" in obj && isValidString(obj.path) &&
    ! ("replace" in obj);
type BuildPathValue = BuildTextPathValue | BuildBinaryPathValue;
const isValidBuildPathValue = (obj: any): obj is BuildPathValue =>
    isValidBuildTextPathValue(obj) || isValidBuildBinaryPathValue(obj);
interface BuildJsonValue extends JsonableObject
{
    json: string;
    value?: string | string[];
}
const isValidBuildJsonValue = (obj: any): obj is BuildJsonValue =>
    "object" === typeof obj &&
    "json" in obj && isValidString(obj.json) &&
    !
    (
        "value" in obj &&
        !
        (
            isValidString(obj.value) ||
            isValidArray(obj.value, isValidString)
        )
    );
interface BuildCallValue extends JsonableObject
{
    call: string;
}
const isValidBuildCallValue = (obj: any): obj is BuildCallValue =>
    "object" === typeof obj &&
    "call" in obj && isValidString(obj.call);
interface BuildResourceValue extends JsonableObject
{
    resource: string;
    base?: string;
}
const isValidBuildResourceValue = (obj: any): obj is BuildResourceValue =>
    "object" === typeof obj &&
    "resource" in obj && isValidString(obj.resource) &&
    ! ("base" in obj && ! isValidString(obj.base));
type BuildValueType = string | BuildPathValue | BuildJsonValue | BuildCallValue | BuildResourceValue;
const isValidBuildValue = (obj: any): obj is BuildValueType =>
    isValidString(obj) ||
    isValidBuildPathValue(obj) ||
    isValidBuildJsonValue(obj) ||
    isValidBuildCallValue(obj) ||
    isValidBuildResourceValue(obj);
const isBuildTextPathValue = isValidBuildTextPathValue;
const isBuildBinaryPathValue = isValidBuildPathValue;
const isBuildJsonValue = isValidBuildJsonValue;
const isBuildCallValue = isValidBuildCallValue;
const isBuildResourceValue = isValidBuildResourceValue;
const isValidPrimeBuildParameters = (obj: any): obj is { [key: string]: BuildValueType } =>
    isValidObject(obj, isValidBuildValue);
interface BuildPrimeTarget extends JsonableObject
{
    template: BuildValueType;
    output: BuildPathValue;
    parameters?: { [key: string]: BuildValueType; } | BuildJsonValue;
}
const isValidBuildPrimeTarget = (mode: any): mode is BuildPrimeTarget =>
    null !== mode &&
    "object" === typeof mode &&
    ! ("template" in mode && ! isValidBuildValue(mode.template)) &&
    ! ("output" in mode && ! isValidBuildPathValue(mode.output)) &&
    ! ("parameters" in mode && ( ! isValidPrimeBuildParameters(mode.parameters) && ! isValidBuildJsonValue(mode.parameters)));
const isBuildPrimeTarget = (mode: any): mode is BuildPrimeTarget =>
    isValidBuildPrimeTarget(mode) &&
    "template" in mode &&
    "output" in mode;
interface BuildProcessTarget extends JsonableObject
{
    processes: string | string[];
}
const isValidBuildProcessTarget = (mode: any): mode is BuildProcessTarget =>
    null !== mode &&
    "object" === typeof mode &&
    "processes" in mode && (isValidString(mode.processes) || isValidArray(mode.processes, isValidString));
interface BuildReferenceTarget extends JsonableObject
{
    references: string;
}
const isValidBuildReferenceTarget = (mode: any): mode is BuildReferenceTarget =>
    null !== mode &&
    "object" === typeof mode &&
    "references" in mode && isValidString(mode.references);
interface BuildMetaTarget extends JsonableObject
{
    meta: BuildTarget;
    parameters: { [key: string]: BuildValueType; }[] | BuildJsonValue;
}
const isValidBuildMetaTarget = (mode: any): mode is BuildMetaTarget =>
    null !== mode &&
    "object" === typeof mode &&
    "meta" in mode && isValidBuildTarget(mode.meta) &&
    "parameters" in mode && (isValidArray(mode.parameters, isValidPrimeBuildParameters) || isValidBuildJsonValue(mode.parameters));
type BuildTarget = BuildPrimeTarget | BuildProcessTarget | BuildReferenceTarget | BuildMetaTarget;
const isValidBuildTarget = (mode: any): mode is BuildTarget =>
    isValidBuildPrimeTarget(mode) ||
    isValidBuildProcessTarget(mode) ||
    isValidBuildReferenceTarget(mode) ||
    isValidBuildMetaTarget(mode);
interface BuildModeBase extends JsonableObject
{
    base?: string;
    parameters?: { [key: string]: BuildValueType; } | BuildJsonValue;
}
const isValidBuildModeBase = (mode: any): mode is BuildModeBase =>
    null !== mode &&
    "object" === typeof mode &&
    ! ("base" in mode && ! isValidString(mode.base)) &&
    ! ("parameters" in mode && ( ! isValidPrimeBuildParameters(mode.parameters) && ! isValidBuildJsonValue(mode.parameters)));
interface SinglePrimeBuildMode extends BuildModeBase, BuildPrimeTarget { }
const isValidSinglePrimeBuildMode = (mode: any): mode is SinglePrimeBuildMode =>
    isValidBuildModeBase(mode) &&
    isValidBuildPrimeTarget(mode);
interface MultiBuildMode extends BuildModeBase
{
    steps: BuildTarget[];
}
const isValidMultiBuildMode = (mode: any): mode is MultiBuildMode =>
    null !== mode &&
    "object" === typeof mode &&
    "steps" in mode && isValidArray(mode.steps, isValidBuildTarget);
type SingleBuildMode = SinglePrimeBuildMode | BuildProcessTarget | BuildReferenceTarget | BuildMetaTarget;
const isValidSingleBuildMode = (mode: any): mode is SingleBuildMode =>
    isValidSinglePrimeBuildMode(mode) ||
    isValidBuildProcessTarget(mode) ||
    isValidBuildReferenceTarget(mode) ||
    isValidBuildMetaTarget(mode);
type BuildMode = SingleBuildMode | MultiBuildMode;
const isValidBuildMode = (mode: any): mode is BuildMode =>
    isValidSingleBuildMode(mode) ||
    isValidMultiBuildMode(mode);
const isSingleBuildMode = (mode: BuildMode): mode is SingleBuildMode => undefined === mode.steps;
//const isMultiBuildMode = (mode: BuildMode): mode is MultiBuildMode => undefined !== mode.steps;
type BuildJson =
{
    $schema: string; // typeof schema,
    modes: { [mode: string]: BuildMode; };
};
const isValidBuildJson = (json: any): json is BuildJson =>
    "object" === typeof json &&
    "$schema" in json && "string" === typeof json.$schema && // schema === json.$schema &&
    "modes" in json && isValidObject(json.modes, isValidBuildMode);
const startAt = new Date();
const getBuildTime = () => new Date().getTime() - startAt.getTime();
const jsonPath = process.argv[2];
const mode = process.argv[3] || "default";
console.log(`🚀 ${jsonPath} ${mode} build start: ${startAt}`);
try
{
    const process = require("process");
    const child_process = require("child_process");
    const fs = require("fs");
    const makePath = (...path : (undefined | string)[]) => path.map(i => undefined !== i ? i: "").join("").replace(/\/\.\//gm, "/");
    const fget = (path: string) => fs.readFileSync(path, { encoding: "utf-8" });
    const evalJsonValue = (value: BuildJsonValue) =>
    {
        let current = JSON.parse(fget(value.json));
        if (undefined !== value.value)
        {
            if (Array.isArray(value.value))
            {
                value.value.forEach(k => current = current[k]);
                current = current;
            }
            else
            {
                current = current[value.value];
            }
        }
        return current;
    };
    const evalValue = (basePath: string, value: BuildValueType) =>
    {
        if ("string" === typeof value)
        {
            return value;
        }
        else
        if (isBuildBinaryPathValue(value))
        {
            let result = fs.readFileSync(value.path);
            result = result.toString(value.encode);
            return result;
        }
        else
        if (isBuildTextPathValue(value))
        {
            let result = fget(value.path);
            if (value.replace)
            {
                if (Array.isArray(value.replace))
                {
                    value.replace.forEach
                    (
                        replace => result = result.replace(new RegExp(replace.match, "gmu"), evalValue(basePath, replace.text))
                    );
                }
                else
                {
                    result = result.replace(new RegExp(value.replace.match, "gmu"), evalValue(basePath, value.replace.text));
                }
            }
            return result;
        }
        else
        if (isBuildJsonValue(value))
        {
            return evalJsonValue(value);
        }
        else
        if (isBuildResourceValue(value))
        {
            const resource = require(makePath(basePath, value.resource));
            return Object.keys(resource)
                .map(id => `<div id="${id}">${fget(makePath(value.base, resource[id])).replace(/[\w\W]*(<svg)/g, "$1")}</div>`)
                .join("");
        }
        else
        if (isBuildCallValue(value))
        {
            switch(value.call)
            {
            case "command":
                return process.argv.join(" ");
            case "command_options":
                return process.argv.filter((_i: string, index: number) => 2 <= index).join(" ");
            case "timestamp":
                return `${startAt}`;
            case "timestamp_tick":
                return `${startAt.getTime()}`;
            default:
                console.error(`🚫 unknown call: ${JSON.stringify(value)}`);
                throw new Error();
            }
        }
        else
        {
            console.error(`🚫 unknown parameter: ${JSON.stringify(value)}`);
            throw new Error();
        }
        return null;
    };
    const evalParameters = (parameters: { [key: string]: BuildValueType; } | BuildJsonValue): { [key: string]: BuildValueType; } =>
    {
        if (isValidBuildJsonValue(parameters))
        {
            return evalJsonValue(parameters);
        }
        return parameters;
    }
    const applyJsonObject = <TargetType extends JsonableObject, SourceType extends JsonableObject>(target: TargetType, source: SourceType): TargetType & SourceType =>
    {
        Object.keys(source).forEach
        (
            key =>
            {
                const targetValue = target[key];
                const sourceValue = source[key];
                if (isJsonableObject(targetValue) && isJsonableObject(sourceValue))
                {
                    applyJsonObject(targetValue, sourceValue);
                }
                else
                {
                    (<any>target)[key] = source[key];
                }
            }
        );
        return <TargetType & SourceType>target;
    };
    const applyJson = (master: BuildJson, target: BuildMode, source: BuildMode) =>
    {
        const base = (source as BuildModeBase).base;
        if (base)
        {
            const baseJson = master.modes[base];
            if (baseJson)
            {
                applyJson(master, target, baseJson);
            }
            else
            {
                console.error(`🚫 unknown base mode: ${JSON.stringify(base)} in ${JSON.stringify(Object.keys(master))}`);
                throw new Error();
            }
        }
        applyJsonObject(target, source);
    };
    const applyParameters = (text: string, parameters: { [key: string]: BuildValueType; }) =>
        Object.keys(parameters).map
        (
            key => ({ key, work: evalValue(basePath, parameters[key]) })
        )
        .reduce
        (
            (r, p) => "string" === typeof p.work ? r.replace(new RegExp(p.key, "g"), p.work): r,
            text
        );
    const buildFile = (template: BuildValueType, output: BuildPathValue, parameters: { [key: string]: BuildValueType; }) =>
    {
        if ( ! template)
        {
            console.error(`🚫 no template`);
            throw new Error();
        }
        if ( ! output)
        {
            console.error(`🚫 no output`);
            throw new Error();
        }
        const file = evalValue(basePath, template);
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
        fs.writeFileSync
        (
            output.path,
            applyParameters(file, parameters)
        );
    }
    const buildTrget = (target: BuildTarget, parameters: { [key: string]: BuildValueType, }) =>
    {
        if (isBuildPrimeTarget(target))
        {
            buildFile
            (
                target.template,
                target.output,
                applyJsonObject
                (
                    simpleDeepCopy(parameters),
                    evalParameters(target.parameters ?? { })
                )
            );
        }
        else
        if (isValidBuildProcessTarget(target))
        {
            (Array.isArray(target.processes) ? target.processes: [ target.processes, ]).forEach
            (
                command =>
                {
                    console.log(`👉 ${command}`);
                    child_process.execSync
                    (
                        command,
                        {
                            stdio: [ "inherit", "inherit", "inherit" ]
                        }
                    );
                }
            );
        }
        else
        if (isValidBuildReferenceTarget(target))
        {
            (Array.isArray(target.references) ? target.references: [ target.references, ])
                .forEach(reference => build(reference));
        }
        else
        if (isValidBuildMetaTarget(target))
        {
            const parameters = isValidBuildJsonValue(target.parameters) ?
                evalJsonValue(target.parameters):
                target.parameters;
            if (isValidArray(parameters, isValidPrimeBuildParameters))
            {
                parameters.forEach
                (
                    p =>
                    {
                        const json = JSON.parse(applyParameters(JSON.stringify(target.meta), p));
                        if (isValidBuildTarget(json))
                        {
                            const parameters = evalParameters
                            (
                                applyJsonObject
                                (
                                    simpleDeepCopy(master.modes.default?.parameters ?? { }),
                                    (json as BuildModeBase).parameters ?? { }
                                )
                            );
                            buildTrget(json, parameters);
                        }
                        else
                        {
                            console.error(`🚫 unknown build target(meta): ${JSON.stringify(json)}`);
                        }
                    }
                );
            }
            else
            {
                console.error(`🚫 invalid meta build parameters: ${JSON.stringify(target)}`);
                throw new Error();
            }
        }
        else
        {
            console.error(`🚫 unknown build target: ${JSON.stringify(target)}`);
            throw new Error();
        }
    };
    const build = (mode: string) =>
    {
        const json: BuildMode = simpleDeepCopy(master.modes.default ?? { });
        const modeJson = master.modes[mode];
        if (modeJson)
        {
            applyJson(master, json, modeJson);
        }
        else
        {
            console.error(`🚫 unknown mode: ${JSON.stringify(mode)} in ${JSON.stringify(Object.keys(master))}`);
            throw new Error();
        }
        const parameters = evalParameters((json as BuildModeBase).parameters ?? { });
        if (isSingleBuildMode(json))
        {
            buildTrget(json, parameters);
        }
        else
        {
            json.steps.forEach(i => buildTrget(i, parameters));
        }
    };
    const basePath = jsonPath.replace(/\/[^\/]+$/, "/");
    const master = require(jsonPath);
    if ( ! isValidBuildJson(master))
    {
        console.error(`🚫 invalid JSON: ${jsonPath}`);
        console.error(`🚫 Use this JSON Schema: ${schema}`);
        throw new Error();
    }
    build(mode);
    console.log(`✅ ${jsonPath} ${mode} build end: ${new Date()} ( ${(getBuildTime() / 1000).toLocaleString()}s )`);
}
catch(error)
{
    console.error(error);
    console.log(`🚫 ${jsonPath} ${mode} build failed: ${new Date()} ( ${(getBuildTime() / 1000).toLocaleString()}s )`);
}
// how to run: `node ./index.js BUILD-JSON-PATH BUILD-MODE`
