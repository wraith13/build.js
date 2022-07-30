'use strict';
export type JsonableValue = null | boolean | number | string;
export interface JsonableObject
{
    [key: string]: undefined | Jsonable;
}
export type Jsonable = JsonableValue | Jsonable[] | JsonableObject;
export const isJsonableObject = (value: Jsonable | undefined): value is JsonableObject =>
    "object" === typeof value && ! Array.isArray(value);
interface BuildPathValue extends JsonableObject
{
    path: string;
    replace?:
    {
        match: string;
        text: string;
    };
}
interface BuildJsonValue extends JsonableObject
{
    json: string;
    key?: string | string[];
}
interface BuildCallValue extends JsonableObject
{
    call: string;
}
interface BuildResourceValue extends JsonableObject
{
    resource: string;
    base?: string;
}
type BuildValueType = string | BuildPathValue | BuildJsonValue | BuildCallValue | BuildResourceValue;
const isBuildPathValue = (value: BuildValueType): value is BuildPathValue =>
    "object" === typeof value &&
    "string" === typeof value.path;
const isBuildJsonValue = (value: BuildValueType): value is BuildJsonValue =>
    "object" === typeof value &&
    "string" === typeof value.json;
const isBuildCallValue = (value: BuildValueType): value is BuildCallValue =>
    "object" === typeof value &&
    "string" === typeof value.call;
const isBuildResourceValue = (value: BuildValueType): value is BuildResourceValue =>
    "object" === typeof value &&
    "string" === typeof value.resource;
interface BuildMode extends JsonableObject
{
    base?: string;
    template?: BuildValueType;
    output?: BuildPathValue;
    preprocesses?: string[];
    parameters?: { [key: string]: BuildValueType; };
}
type BuildJson =
{
    [mode: string]: BuildMode;
};
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
    const evalValue = (basePath: string, value: BuildValueType) =>
    {
        if ("string" === typeof value)
        {
            return value;
        }
        else
        if (isBuildPathValue(value))
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
            let result = fget(value.json);
            if (undefined !== value.key)
            {
                let current = JSON.parse(result);
                if (Array.isArray(value.key))
                {
                    value.key.forEach(k => current = current[k]);
                    result = `${current}`;
                }
                else
                {
                    result = `${current[value.key]}`;
                }
            }
            return result;
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
                return `${new Date()}`;
            case "timestamp_tick":
                return `${new Date().getTime()}`;
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
    const basePath = jsonPath.replace(/\/[^\/]+$/, "/");
    const master = require(jsonPath) as BuildJson;
    const json = master.default ?? { };
    const modeJson = master[mode];
    const applyJsonObject = (target: JsonableObject, source: JsonableObject) =>
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
                    target[key] = source[key];
                }
            }
        );
    };
    const applyJson = (master: BuildJson, target: BuildMode, source: BuildMode) =>
    {
        const base = source.base;
        if (base)
        {
            const baseJson = master[base];
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
    if (modeJson)
    {
        applyJson(master, json, modeJson);
    }
    else
    {
        console.error(`🚫 unknown mode: ${JSON.stringify(mode)} in ${JSON.stringify(Object.keys(master))}`);
        throw new Error();
    }
    (json?.preprocesses || [ ]).forEach
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
    if ( ! json.template)
    {
        console.error(`🚫 no template`);
        throw new Error();
    }
    const template = evalValue(basePath, json.template);
    const parameters = json.parameters || { };
    Object.keys(parameters).forEach
    (
        key =>
        {
            if (template === template.replace(new RegExp(key, "g"), ""))
            {
                console.error(`🚫 ${key} not found in ${JSON.stringify(json.template)}.`);
                throw new Error();
            }
        }
    );
    if ( ! json.output)
    {
        console.error(`🚫 no output`);
        throw new Error();
    }
    fs.writeFileSync
    (
        json.output.path,
        Object.keys(parameters).map
        (
            key => ({ key, work: evalValue(basePath, parameters[key]) })
        )
        .reduce
        (
            (r, p) => "string" === typeof p.work ? r.replace(new RegExp(p.key, "g"), p.work): r,
            template
        )
    );
    console.log(`✅ ${jsonPath} ${mode} build end: ${new Date()} ( ${(getBuildTime() / 1000).toLocaleString()}s )`);
}
catch
{
    console.log(`🚫 ${jsonPath} ${mode} build failed: ${new Date()} ( ${(getBuildTime() / 1000).toLocaleString()}s )`);
}

// how to run: `node ./build.js BUILD-JSON-PATH BUILD-MODE`
