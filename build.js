'use strict';
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
    const makePath = (...path) => path.map(i => undefined !== i ? i: "").join("").replace(/\/\.\//gm, "/");
    const fget = (path) => fs.readFileSync(path, { encoding: "utf-8" });
    const evalValue = (base, value) =>
    {
        if ("string" === typeof value)
        {
            return value;
        }
        else
        if ("string" === typeof value.path)
        {
            let result = fget(value.path);
            if (value.replace)
            {
                if (Array.isArray(value.replace))
                {
                    value.replace.forEach
                    (
                        replace => result = result.replace(new RegExp(replace.match, "gmu"), evalValue(base, replace.text))
                    )
                }
                else
                {
                    result = result.replace(new RegExp(value.replace.match, "gmu"), evalValue(base, value.replace.text));
                }
            }
            return result;
        }
        else
        if ("string" === typeof value.json)
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
        if ("string" === typeof value.resource)
        {
            const resource = require(makePath(base, value.resource));
            return Object.keys(resource)
                .map(id => `<div id="${id}">${fget(makePath(value.base, resource[id])).replace(/[\w\W]*(<svg)/g, "$1")}</div>`)
                .join("");
        }
        else
        if (undefined !== value.call)
        {
            switch(value.call)
            {
            case "command":
                return process.argv.join(" ");
            case "command_options":
                return process.argv.filter((_i, index) => 2 <= index).join(" ");
            case "timestamp":
                return `${new Date()}`;
            case "timestamp_tick":
                return `${new Date().getTime()}`;
            default:
                console.error(`🚫 unknown call: ${key}: ${JSON.stringify(value)}`);
                throw new Error();
            }
        }
        else
        {
            console.error(`🚫 unknown parameter: ${key}: ${JSON.stringify(value)}`);
            throw new Error();
        }
        return null;
    };
    const base = jsonPath.replace(/\/[^\/]+$/, "/");
    const master = require(jsonPath);
    const json = master.default ?? { };
    const modeJson = master[mode];
    const applyJsonObject = (target, source) =>
    {
        Object.keys(source).forEach
        (
            key =>
            {
                if ("object" !== typeof target[key] || "object" !== typeof source[key])
                {
                    target[key] = source[key];
                }
                else
                if (Array.isArray(target[key]) || Array.isArray(source[key]))
                {
                    target[key] = source[key];
                }
                else
                {
                    applyJsonObject(target[key], source[key]);
                }
            }
        );
    };
    const applyJson = (master, target, source) =>
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
    const template = evalValue(base, json.template);
    Object.keys(json.parameters).forEach
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
    fs.writeFileSync
    (
        json.output.path,
        Object.keys(json.parameters).map
        (
            key => ({ key, work: evalValue(base, json.parameters[key]) })
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
