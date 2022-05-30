'use strict';
const startAt = new Date();
const getBuildTime = () => new Date().getTime() - startAt.getTime();
console.log(`build start: ${startAt} 🚀`);
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
            }
        }
        else
        {
            console.error(`🚫 unknown parameter: ${key}: ${JSON.stringify(value)}`);
        }
        return null;
    };
    const jsonPath = process.argv[2];
    const base = jsonPath.replace(/\/[^\/]+$/, "/");
    const json = require(jsonPath);
    (json.preprocesses[process.argv[3] || "default"] || [ ]).forEach
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
    console.log(`build end: ${new Date()} ( ${(getBuildTime() / 1000).toLocaleString()}s ) ✅`);
}
catch
{
    console.log(`build failed: ${new Date()} ( ${(getBuildTime() / 1000).toLocaleString()}s ) 🚫`);
}

// how to run: `node ./build.js BUILD-JSON-PATH BUILD-OPTION`
