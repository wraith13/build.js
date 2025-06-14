"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.EvilType = void 0;
var evil_type_1 = require("../evil-type.ts/common/evil-type");
Object.defineProperty(exports, "EvilType", { enumerable: true, get: function () { return evil_type_1.EvilType; } });
var Type;
(function (Type) {
    Type.isTextPathValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.textPathValueValidatorObject, { additionalProperties: false }); });
    Type.isBinaryPathValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.binaryPathValueValidatorObject, { additionalProperties: false }); });
    Type.isPathValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(Type.isTextPathValue, Type.isBinaryPathValue); });
    Type.isJsonValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.jsonValueValidatorObject); });
    Type.isNotJsonValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.notJsonValueValidatorObject); });
    Type.isCallValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.callValueValidatorObject, { additionalProperties: false }); });
    Type.isResourceValue = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.resourceValueValidatorObject, { additionalProperties: false }); });
    Type.isValueType = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isString, Type.isPathValue, Type.isJsonValue, Type.isCallValue, Type.isResourceValue); });
    Type.isParametersType = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isAnd(evil_type_1.EvilType.Validator.isDictionaryObject(Type.isValueType), Type.isNotJsonValue), Type.isJsonValue); });
    Type.isBuildModeBase = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildModeBaseValidatorObject, { additionalProperties: false }); });
    Type.isBuildPrimeTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildPrimeTargetValidatorObject, { additionalProperties: false }); });
    Type.isSinglePrimeMode = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.singlePrimeModeValidatorObject, { additionalProperties: false }); });
    Type.isBuildProcessTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildProcessTargetValidatorObject); });
    Type.isBuildReferenceTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildReferenceTargetValidatorObject); });
    Type.isBuildMetaTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.buildMetaTargetValidatorObject, { additionalProperties: false }); });
    Type.isBuildTarget = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(Type.isBuildPrimeTarget, Type.isBuildProcessTarget, Type.isBuildReferenceTarget, Type.isBuildMetaTarget); });
    Type.isSingleMode = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(Type.isSinglePrimeMode, Type.isBuildProcessTarget, Type.isBuildReferenceTarget, Type.isBuildMetaTarget); });
    Type.isPartialSingleMode = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.partialSingleModeValidatorObject, { additionalProperties: false
    }); });
    Type.isMultiMode = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.multiModeValidatorObject, { additionalProperties: false }); });
    Type.isMode = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isOr(Type.isPartialSingleMode, Type.isSingleMode, Type.isMultiMode); });
    Type.isRoot = evil_type_1.EvilType.lazy(function () { return evil_type_1.EvilType.Validator.isSpecificObject(Type.rootValidatorObject, { additionalProperties: false }); });
    Type.textPathValueValidatorObject = ({ path: evil_type_1.EvilType.Validator.isString, replace: evil_type_1.EvilType.Validator.isOptional(({ match: evil_type_1.EvilType.Validator.isString, text: Type.isValueType, })), });
    Type.binaryPathValueValidatorObject = ({ path: evil_type_1.EvilType.Validator.isString, encode: evil_type_1.EvilType.Validator.isEnum(["base64", "hex"]), });
    Type.jsonValueValidatorObject = ({ json: evil_type_1.EvilType.Validator.isString, value: evil_type_1.EvilType.Validator.isOptional(evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isString, evil_type_1.EvilType.Validator.isArray(evil_type_1.EvilType.Validator.isString))), });
    Type.notJsonValueValidatorObject = ({ json: { "$type": "never-type-guard" }, });
    Type.callValueValidatorObject = ({ call: evil_type_1.EvilType.Validator.isEnum(["command", "command_options",
            "timestamp", "timestamp_tick"]), });
    Type.resourceValueValidatorObject = ({ resource: evil_type_1.EvilType.Validator.isString, base: evil_type_1.EvilType.Validator.isOptional(evil_type_1.EvilType.Validator.isString), });
    Type.buildModeBaseValidatorObject = ({ base: evil_type_1.EvilType.Validator.isOptional(evil_type_1.EvilType.Validator.isString), parameters: evil_type_1.EvilType.Validator.isOptional(Type.isParametersType), });
    Type.buildPrimeTargetValidatorObject = ({ template: Type.isValueType, output: Type.isPathValue,
        parameters: evil_type_1.EvilType.Validator.isOptional(Type.isParametersType), });
    Type.singlePrimeModeValidatorObject = evil_type_1.EvilType.Validator.mergeObjectValidator(Type.buildModeBaseValidatorObject, Type.buildPrimeTargetValidatorObject, {});
    Type.buildProcessTargetValidatorObject = ({ processes: evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isString, evil_type_1.EvilType.Validator.isArray(evil_type_1.EvilType.Validator.isString)), });
    Type.buildReferenceTargetValidatorObject = ({ references: evil_type_1.EvilType.Validator.isString, });
    Type.buildMetaTargetValidatorObject = ({ meta: Type.isBuildTarget, parameters: evil_type_1.EvilType.Validator.isOr(evil_type_1.EvilType.Validator.isArray(Type.isParametersType), Type.isJsonValue), });
    Type.partialSingleModeValidatorObject = ({ parameters: Type.isParametersType, });
    Type.multiModeValidatorObject = evil_type_1.EvilType.Validator.mergeObjectValidator(Type.buildModeBaseValidatorObject, { steps: evil_type_1.EvilType.Validator.isArray(Type.isBuildTarget), });
    Type.rootValidatorObject = ({ $schema: evil_type_1.EvilType.Validator.isJust("https://raw.githubusercontent.com/wraith13/build.js/master/generated/json-schema.json#"), modes: evil_type_1.EvilType.Validator.isDictionaryObject(Type.isMode), });
})(Type || (exports.Type = Type = {}));
//# sourceMappingURL=type.js.map