"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.EvilType = void 0;
var evil_type_1 = require("../evil-type.ts/common/evil-type");
Object.defineProperty(exports, "EvilType", { enumerable: true, get: function () { return evil_type_1.EvilType; } });
var Type;
(function (Type) {
    Type.isBuildTextPathValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildTextPathValueValidatorObject, {
        additionalProperties: false
    }); });
    Type.isBuildBinaryPathValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildBinaryPathValueValidatorObject, {
        additionalProperties: false
    }); });
    Type.isBuildPathValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(Type.isBuildTextPathValue, Type.isBuildBinaryPathValue); });
    Type.isJsonValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.jsonValueValidatorObject, { additionalProperties: false }); });
    Type.isBuildCallValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildCallValueValidatorObject, {
        additionalProperties: false
    }); });
    Type.isBuildResourceValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildResourceValueValidatorObject, {
        additionalProperties: false
    }); });
    Type.isBuildValueType = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isString, Type.isBuildPathValue, Type.isJsonValue, Type.isBuildCallValue, Type.isBuildResourceValue); });
    Type.isBuildModeBase = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildModeBaseValidatorObject, {
        additionalProperties: false
    }); });
    Type.isBuildPrimeTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildPrimeTargetValidatorObject, {
        additionalProperties: false
    }); });
    Type.isSinglePrimeBuildMode = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.singlePrimeBuildModeValidatorObject, {
        additionalProperties: false
    }); });
    Type.isBuildProcessTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildProcessTargetValidatorObject, {
        additionalProperties: false
    }); });
    Type.isBuildReferenceTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildReferenceTargetValidatorObject, {
        additionalProperties: false
    }); });
    Type.isBuildMetaTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildMetaTargetValidatorObject, {
        additionalProperties: false
    }); });
    Type.isBuildTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(Type.isBuildPrimeTarget, Type.isBuildProcessTarget, Type.isBuildReferenceTarget, Type.isBuildMetaTarget); });
    Type.isSingleMode = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(Type.isSinglePrimeBuildMode, Type.isBuildProcessTarget, Type.isBuildReferenceTarget, Type.isBuildMetaTarget); });
    Type.isMultiMode = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.multiModeValidatorObject, { additionalProperties: false }); });
    Type.isMode = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(Type.isSingleMode, Type.isMultiMode); });
    Type.isRoot = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.rootValidatorObject, { additionalProperties: false }); });
    Type.buildTextPathValueValidatorObject = ({ path: evil_type_1.EvilType.Validator.isString, replace: evil_type_1.EvilType.Validator.isOptional(({ match: evil_type_1.EvilType.Validator.isString, text: Type.isBuildValueType,
        })), });
    Type.buildBinaryPathValueValidatorObject = ({ path: evil_type_1.EvilType.Validator.isString, encode: evil_type_1.EvilType.Validator.isEnum(["base64", "hex"]), });
    Type.jsonValueValidatorObject = ({ json: evil_type_1.EvilType.Validator.isString, value: evil_type_1.EvilType.Validator.isOptional(evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isString, evil_type_1.EvilType.Validator.isArray(evil_type_1.EvilType.Validator.isString))), });
    Type.buildCallValueValidatorObject = ({ call: evil_type_1.EvilType.Validator.isEnum([
            "command", "command_options", "timestamp", "timestamp_tick"
        ]), });
    Type.buildResourceValueValidatorObject = ({ resource: evil_type_1.EvilType.Validator.isString, base: evil_type_1.EvilType.Validator.isOptional(evil_type_1.EvilType.Validator.isString), });
    Type.buildModeBaseValidatorObject = ({ base: evil_type_1.EvilType.Validator.isString,
        parameters: evil_type_1.EvilType.Validator.isOptional(evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isDictionaryObject(Type.isBuildValueType), Type.isJsonValue)), });
    Type.buildPrimeTargetValidatorObject = ({ template: Type.isBuildValueType,
        output: Type.isBuildPathValue, parameters: evil_type_1.EvilType.Validator.isOptional(evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isDictionaryObject(Type.isBuildValueType), Type.isJsonValue)), });
    Type.singlePrimeBuildModeValidatorObject = evil_type_1.EvilType.Validator.mergeObjectValidator(Type.buildModeBaseValidatorObject, Type.buildPrimeTargetValidatorObject, {});
    Type.buildProcessTargetValidatorObject = ({ processes: evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isString, evil_type_1.EvilType.Validator.isArray(evil_type_1.EvilType.Validator.isString)), });
    Type.buildReferenceTargetValidatorObject = ({ references: evil_type_1.EvilType.Validator.isString, });
    Type.buildMetaTargetValidatorObject = ({ meta: Type.isBuildTarget, parameters: evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isDictionaryObject(Type.isBuildValueType), Type.isJsonValue), });
    Type.multiModeValidatorObject = evil_type_1.EvilType.Validator.mergeObjectValidator(Type.buildModeBaseValidatorObject, { steps: evil_type_1.EvilType.Validator.isArray(Type.isBuildTarget), output: Type.isBuildPathValue, });
    Type.rootValidatorObject = ({ $schema: evil_type_1.EvilType.Validator.isJust("https://raw.githubusercontent.com/wraith13/build.js/master/generated/json-schema.json#"), modes: evil_type_1.EvilType.Validator.isDictionaryObject(Type.isMode), });
})(Type || (exports.Type = Type = {}));
//# sourceMappingURL=type.js.map