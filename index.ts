import { Type, EvilType } from "./generated/type";
const schema = "https://raw.githubusercontent.com/wraith13/build.js/master/json-schema.json#";
const simpleDeepCopy = <ValueType>(value: ValueType): ValueType => <ValueType>JSON.parse(JSON.stringify(value));
export type JsonableValue = null | boolean | number | string;
export interface JsonableObject
{
    [key: string]: undefined | Jsonable;
}
export type Jsonable = JsonableValue | Jsonable[] | JsonableObject;
export const isJsonableObject = (value: Jsonable | undefined): value is JsonableObject =>
    "object" === typeof value && ! Array.isArray(value);
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
    const evalJsonValue = (value: Type.JsonValue) =>
    {
        let current = JSON.parse(fget(value.json));
        if (undefined !== value.value)
        {
            if (Array.isArray(value.value))
            {
                value.value.forEach(k => current = current[k]);
            }
            else
            {
                current = current[value.value];
            }
        }
        if ("string" === typeof current)
        {
            return current;
        }
        else
        {
            let base = simpleDeepCopy(value) as unknown as JsonableObject;
            delete base.json;
            delete base.value;
            return applyJsonObject(base, current);
        }
    };
    const evalValue = (basePath: string, value: Type.ValueType) =>
    {
        if ("string" === typeof value)
        {
            return value;
        }
        else
        if (Type.isBinaryPathValue(value))
        {
            let result = fs.readFileSync(value.path);
            result = result.toString(value.encode);
            return result;
        }
        else
        if (Type.isTextPathValue(value))
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
        if (Type.isJsonValue(value))
        {
            return evalJsonValue(value);
        }
        else
        if (Type.isResourceValue(value))
        {
            const resource = require(makePath(basePath, value.resource));
            return Object.keys(resource)
                .map(id => `<div id="${id}">${fget(makePath(value.base, resource[id])).replace(/[\w\W]*(<svg)/g, "$1")}</div>`)
                .join("");
        }
        else
        if (Type.isCallValue(value))
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
    const evalParameters = (parameters: { [key: string]: Type.ValueType; } | Type.JsonValue): { [key: string]: Type.ValueType; } =>
    {
        if (Type.isJsonValue(parameters))
        {
            return evalJsonValue(parameters);
        }
        return parameters;
    }
    const applyJsonObject = <TargetType extends object, SourceType extends object>(target: TargetType, source: SourceType): TargetType & SourceType =>
    {
        Object.keys(source).forEach
        (
            key =>
            {
                const targetValue = target[key as keyof TargetType] as Jsonable | undefined;
                const sourceValue = source[key as keyof SourceType] as Jsonable | undefined;
                if (isJsonableObject(targetValue) && isJsonableObject(sourceValue))
                {
                    applyJsonObject(targetValue, sourceValue);
                }
                else
                {
                    (<any>target)[key] = source[key as keyof SourceType];
                }
            }
        );
        return <TargetType & SourceType>target;
    };
    const applyJson = (master: Type.Root, target: Type.Mode, source: Type.Mode) =>
    {
        const base = (source as Type.BuildModeBase).base;
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
    const applyParameters = (text: string, parameters: { [key: string]: Type.ValueType; }) =>
        Object.keys(parameters).map
        (
            key => ({ key, work: evalValue(basePath, parameters[key]) })
        )
        .reduce
        (
            (r, p) => "string" === typeof p.work ? r.replace(new RegExp(p.key, "g"), p.work): r,
            text
        );
    const buildFile = (template: Type.ValueType, output: Type.PathValue, parameters: { [key: string]: Type.ValueType; }) =>
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
    const buildTrget = (target: Type.BuildTarget, parameters: { [key: string]: Type.ValueType, }) =>
    {
        if (Type.isBuildPrimeTarget(target))
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
        if (Type.isBuildProcessTarget(target))
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
        if (Type.isBuildReferenceTarget(target))
        {
            (Array.isArray(target.references) ? target.references: [ target.references, ])
                .forEach(reference => build(reference));
        }
        else
        if (Type.isBuildMetaTarget(target))
        {
            const parameters = Type.isJsonValue(target.parameters) ?
                evalJsonValue(target.parameters):
                target.parameters;
            //if (isValidArray(parameters, isValidPrimeBuildParameters))
            if (EvilType.Validator.isArray(EvilType.Validator.isDictionaryObject(Type.isValueType))(parameters))
            {
                parameters.forEach
                (
                    p =>
                    {
                        const json = JSON.parse(applyParameters(JSON.stringify(target.meta), p));
                        if (Type.isBuildTarget(json))
                        {
                            const parameters = evalParameters
                            (
                                applyJsonObject
                                (
                                    simpleDeepCopy(master.modes.default?.parameters ?? { }),
                                    ((json as unknown as Type.BuildModeBase).parameters ?? { })
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
        const json: Type.Mode = simpleDeepCopy(master.modes.default ?? { });
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
        const parameters = evalParameters((json as Type.BuildModeBase).parameters ?? { });
        if (Type.isMultiMode(json))
        {
            json.steps.forEach(i => buildTrget(i, parameters));
        }
        else
        if (Type.isSingleMode(json))
        {
            buildTrget(json, parameters);
        }
        else
        {
            const listner = EvilType.Error.makeListener(mode);
            EvilType.Validator.isOr(Type.isSingleMode, Type.isMultiMode)(json, listner);
            console.error(listner.errors);
            console.error(`🚫 unknown mode type: ${JSON.stringify(mode)} in ${JSON.stringify(json)}`);
            throw new Error();
        }
    };
    const basePath = jsonPath.replace(/\/[^\/]+$/, "/");
    const master = require(jsonPath);
    const listner = EvilType.Error.makeListener(jsonPath);
    if ( ! Type.isRoot(master, listner))
    {
        console.error(`🚫 invalid JSON: ${jsonPath}`);
        console.error(`🚫 Use this JSON Schema: ${schema}`);
        console.error(listner.errors);
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
