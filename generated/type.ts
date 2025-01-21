import { EvilType } from "../evil-type.ts/common/evil-type";
export { EvilType };
export namespace Type
{
    export interface BuildTextPathValue
    {
        path: string;
        replace?: { match: string; text: ValueType; };
    }
    export interface BuildBinaryPathValue
    {
        path: string;
        encode: "base64" | "hex";
    }
    export type BuildPathValue = BuildTextPathValue | BuildBinaryPathValue;
    export interface JsonValue
    {
        json: string;
        value?: string | (string[]);
    }
    export interface BuildCallValue
    {
        call: "command" | "command_options" | "timestamp" | "timestamp_tick";
    }
    export interface ResourceValue
    {
        resource: string;
        base?: string;
    }
    export type ValueType = string | BuildPathValue | JsonValue | BuildCallValue | ResourceValue;
    export interface BuildModeBase
    {
        base: string;
        parameters?: { [ key: string ]: ValueType; } | JsonValue;
    }
    export interface BuildPrimeTarget
    {
        template: ValueType;
        output: BuildPathValue;
        parameters?: { [ key: string ]: ValueType; } | JsonValue;
    }
    export interface SinglePrimeMode extends BuildModeBase, BuildPrimeTarget
    {
    }
    export interface BuildProcessTarget
    {
        processes: string | (string[]);
    }
    export interface BuildReferenceTarget
    {
        references: string;
    }
    export interface BuildMetaTarget
    {
        meta: BuildTarget;
        parameters: { [ key: string ]: ValueType; } | JsonValue;
    }
    export type BuildTarget = BuildPrimeTarget | BuildProcessTarget | BuildReferenceTarget | BuildMetaTarget;
    export type SingleMode = SinglePrimeMode | BuildProcessTarget | BuildReferenceTarget | BuildMetaTarget;
    export interface MultiMode extends BuildModeBase
    {
        steps: BuildTarget[];
        output: BuildPathValue;
    }
    export type Mode = SingleMode | MultiMode;
    export interface Root
    {
        $schema: "https://raw.githubusercontent.com/wraith13/build.js/master/generated/json-schema.json#";
        modes: { [ key: string ]: Mode; };
    }
    export const isBuildTextPathValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildTextPathValueValidatorObject, {
        additionalProperties: false }));
    export const isBuildBinaryPathValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildBinaryPathValueValidatorObject, {
        additionalProperties: false }));
    export const isBuildPathValue: EvilType.Validator.IsType<BuildPathValue> = EvilType.lazy(() => EvilType.Validator.isOr(
        isBuildTextPathValue, isBuildBinaryPathValue));
    export const isJsonValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(jsonValueValidatorObject, { additionalProperties:
        false }));
    export const isBuildCallValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildCallValueValidatorObject, {
        additionalProperties: false }));
    export const isResourceValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(resourceValueValidatorObject, {
        additionalProperties: false }));
    export const isValueType: EvilType.Validator.IsType<ValueType> = EvilType.lazy(() => EvilType.Validator.isOr(
        EvilType.Validator.isString, isBuildPathValue, isJsonValue, isBuildCallValue, isResourceValue));
    export const isBuildModeBase = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildModeBaseValidatorObject, {
        additionalProperties: false }));
    export const isBuildPrimeTarget = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildPrimeTargetValidatorObject, {
        additionalProperties: false }));
    export const isSinglePrimeMode = EvilType.lazy(() => EvilType.Validator.isSpecificObject(singlePrimeModeValidatorObject, {
        additionalProperties: false }));
    export const isBuildProcessTarget = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildProcessTargetValidatorObject, {
        additionalProperties: false }));
    export const isBuildReferenceTarget = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildReferenceTargetValidatorObject, {
        additionalProperties: false }));
    export const isBuildMetaTarget = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildMetaTargetValidatorObject, {
        additionalProperties: false }));
    export const isBuildTarget: EvilType.Validator.IsType<BuildTarget> = EvilType.lazy(() => EvilType.Validator.isOr(isBuildPrimeTarget,
        isBuildProcessTarget, isBuildReferenceTarget, isBuildMetaTarget));
    export const isSingleMode: EvilType.Validator.IsType<SingleMode> = EvilType.lazy(() => EvilType.Validator.isOr(isSinglePrimeMode,
        isBuildProcessTarget, isBuildReferenceTarget, isBuildMetaTarget));
    export const isMultiMode = EvilType.lazy(() => EvilType.Validator.isSpecificObject(multiModeValidatorObject, { additionalProperties:
        false }));
    export const isMode: EvilType.Validator.IsType<Mode> = EvilType.lazy(() => EvilType.Validator.isOr(isSingleMode, isMultiMode));
    export const isRoot = EvilType.lazy(() => EvilType.Validator.isSpecificObject(rootValidatorObject, { additionalProperties: false }));
    export const buildTextPathValueValidatorObject: EvilType.Validator.ObjectValidator<BuildTextPathValue> = ({ path:
        EvilType.Validator.isString, replace: EvilType.Validator.isOptional(({ match: EvilType.Validator.isString, text: isValueType, })),
        });
    export const buildBinaryPathValueValidatorObject: EvilType.Validator.ObjectValidator<BuildBinaryPathValue> = ({ path:
        EvilType.Validator.isString, encode: EvilType.Validator.isEnum([ "base64", "hex" ] as const), });
    export const jsonValueValidatorObject: EvilType.Validator.ObjectValidator<JsonValue> = ({ json: EvilType.Validator.isString, value:
        EvilType.Validator.isOptional(EvilType.Validator.isOr(EvilType.Validator.isString, EvilType.Validator.isArray(
        EvilType.Validator.isString))), });
    export const buildCallValueValidatorObject: EvilType.Validator.ObjectValidator<BuildCallValue> = ({ call: EvilType.Validator.isEnum([
        "command", "command_options", "timestamp", "timestamp_tick" ] as const), });
    export const resourceValueValidatorObject: EvilType.Validator.ObjectValidator<ResourceValue> = ({ resource: EvilType.Validator.isString
        , base: EvilType.Validator.isOptional(EvilType.Validator.isString), });
    export const buildModeBaseValidatorObject: EvilType.Validator.ObjectValidator<BuildModeBase> = ({ base: EvilType.Validator.isString,
        parameters: EvilType.Validator.isOptional(EvilType.Validator.isOr(EvilType.Validator.isDictionaryObject(isValueType), isJsonValue))
        , });
    export const buildPrimeTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildPrimeTarget> = ({ template: isValueType, output:
        isBuildPathValue, parameters: EvilType.Validator.isOptional(EvilType.Validator.isOr(EvilType.Validator.isDictionaryObject(
        isValueType), isJsonValue)), });
    export const singlePrimeModeValidatorObject: EvilType.Validator.ObjectValidator<SinglePrimeMode> =
        EvilType.Validator.mergeObjectValidator(buildModeBaseValidatorObject, buildPrimeTargetValidatorObject, { });
    export const buildProcessTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildProcessTarget> = ({ processes:
        EvilType.Validator.isOr(EvilType.Validator.isString, EvilType.Validator.isArray(EvilType.Validator.isString)), });
    export const buildReferenceTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildReferenceTarget> = ({ references:
        EvilType.Validator.isString, });
    export const buildMetaTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildMetaTarget> = ({ meta: isBuildTarget, parameters:
        EvilType.Validator.isOr(EvilType.Validator.isDictionaryObject(isValueType), isJsonValue), });
    export const multiModeValidatorObject: EvilType.Validator.ObjectValidator<MultiMode> = EvilType.Validator.mergeObjectValidator(
        buildModeBaseValidatorObject, { steps: EvilType.Validator.isArray(isBuildTarget), output: isBuildPathValue, });
    export const rootValidatorObject: EvilType.Validator.ObjectValidator<Root> = ({ $schema: EvilType.Validator.isJust(
        "https://raw.githubusercontent.com/wraith13/build.js/master/generated/json-schema.json#" as const), modes:
        EvilType.Validator.isDictionaryObject(isMode), });
}
