import { EvilType } from "../evil-type.ts/common/evil-type";
export { EvilType };
export namespace Type
{
    export interface TextPathValue
    {
        path: string;
        replace?: { match: string; text: ValueType; };
    }
    export interface BinaryPathValue
    {
        path: string;
        encode: "base64" | "hex";
    }
    export type PathValue = TextPathValue | BinaryPathValue;
    export interface JsonValue
    {
        json: string;
        value?: string | (string[]);
    }
    export interface CallValue
    {
        call: "command" | "command_options" | "timestamp" | "timestamp_tick";
    }
    export interface ResourceValue
    {
        resource: string;
        base?: string;
    }
    export type ValueType = string | PathValue | JsonValue | CallValue | ResourceValue;
    export interface BuildModeBase
    {
        base?: string;
        parameters?: { [ key: string ]: ValueType; } | JsonValue;
    }
    export interface BuildPrimeTarget
    {
        template: ValueType;
        output: PathValue;
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
    export interface PartialSingleMode
    {
        base?: string;
        template?: ValueType;
        output?: PathValue;
        parameters?: { [ key: string ]: ValueType; } | JsonValue;
    }
    export interface MultiMode extends BuildModeBase
    {
        steps: BuildTarget[];
    }
    export type Mode = PartialSingleMode | SingleMode | MultiMode;
    export interface Root
    {
        $schema: "https://raw.githubusercontent.com/wraith13/build.js/master/generated/json-schema.json#";
        modes: { [ key: string ]: Mode; };
    }
    export const isTextPathValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(textPathValueValidatorObject, {
        additionalProperties: false }));
    export const isBinaryPathValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(binaryPathValueValidatorObject, {
        additionalProperties: false }));
    export const isPathValue: EvilType.Validator.IsType<PathValue> = EvilType.lazy(() => EvilType.Validator.isOr(isTextPathValue,
        isBinaryPathValue));
    export const isJsonValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(jsonValueValidatorObject, { additionalProperties:
        false }));
    export const isCallValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(callValueValidatorObject, { additionalProperties:
        false }));
    export const isResourceValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(resourceValueValidatorObject, {
        additionalProperties: false }));
    export const isValueType: EvilType.Validator.IsType<ValueType> = EvilType.lazy(() => EvilType.Validator.isOr(
        EvilType.Validator.isString, isPathValue, isJsonValue, isCallValue, isResourceValue));
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
    export const isPartialSingleMode = EvilType.lazy(() => EvilType.Validator.isSpecificObject(partialSingleModeValidatorObject, {
        additionalProperties: false }));
    export const isMultiMode = EvilType.lazy(() => EvilType.Validator.isSpecificObject(multiModeValidatorObject, { additionalProperties:
        false }));
    export const isMode: EvilType.Validator.IsType<Mode> = EvilType.lazy(() => EvilType.Validator.isOr(isPartialSingleMode, isSingleMode,
        isMultiMode));
    export const isRoot = EvilType.lazy(() => EvilType.Validator.isSpecificObject(rootValidatorObject, { additionalProperties: false }));
    export const textPathValueValidatorObject: EvilType.Validator.ObjectValidator<TextPathValue> = ({ path: EvilType.Validator.isString,
        replace: EvilType.Validator.isOptional(({ match: EvilType.Validator.isString, text: isValueType, })), });
    export const binaryPathValueValidatorObject: EvilType.Validator.ObjectValidator<BinaryPathValue> = ({ path: EvilType.Validator.isString
        , encode: EvilType.Validator.isEnum([ "base64", "hex" ] as const), });
    export const jsonValueValidatorObject: EvilType.Validator.ObjectValidator<JsonValue> = ({ json: EvilType.Validator.isString, value:
        EvilType.Validator.isOptional(EvilType.Validator.isOr(EvilType.Validator.isString, EvilType.Validator.isArray(
        EvilType.Validator.isString))), });
    export const callValueValidatorObject: EvilType.Validator.ObjectValidator<CallValue> = ({ call: EvilType.Validator.isEnum([ "command",
        "command_options", "timestamp", "timestamp_tick" ] as const), });
    export const resourceValueValidatorObject: EvilType.Validator.ObjectValidator<ResourceValue> = ({ resource: EvilType.Validator.isString
        , base: EvilType.Validator.isOptional(EvilType.Validator.isString), });
    export const buildModeBaseValidatorObject: EvilType.Validator.ObjectValidator<BuildModeBase> = ({ base: EvilType.Validator.isOptional(
        EvilType.Validator.isString), parameters: EvilType.Validator.isOptional(EvilType.Validator.isOr(
        EvilType.Validator.isDictionaryObject(isValueType), isJsonValue)), });
    export const buildPrimeTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildPrimeTarget> = ({ template: isValueType, output:
        isPathValue, parameters: EvilType.Validator.isOptional(EvilType.Validator.isOr(EvilType.Validator.isDictionaryObject(isValueType),
        isJsonValue)), });
    export const singlePrimeModeValidatorObject: EvilType.Validator.ObjectValidator<SinglePrimeMode> =
        EvilType.Validator.mergeObjectValidator(buildModeBaseValidatorObject, buildPrimeTargetValidatorObject, { });
    export const buildProcessTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildProcessTarget> = ({ processes:
        EvilType.Validator.isOr(EvilType.Validator.isString, EvilType.Validator.isArray(EvilType.Validator.isString)), });
    export const buildReferenceTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildReferenceTarget> = ({ references:
        EvilType.Validator.isString, });
    export const buildMetaTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildMetaTarget> = ({ meta: isBuildTarget, parameters:
        EvilType.Validator.isOr(EvilType.Validator.isDictionaryObject(isValueType), isJsonValue), });
    export const partialSingleModeValidatorObject: EvilType.Validator.ObjectValidator<PartialSingleMode> = ({ base:
        EvilType.Validator.isOptional(EvilType.Validator.isString), template: EvilType.Validator.isOptional(isValueType), output:
        EvilType.Validator.isOptional(isPathValue), parameters: EvilType.Validator.isOptional(EvilType.Validator.isOr(
        EvilType.Validator.isDictionaryObject(isValueType), isJsonValue)), });
    export const multiModeValidatorObject: EvilType.Validator.ObjectValidator<MultiMode> = EvilType.Validator.mergeObjectValidator(
        buildModeBaseValidatorObject, { steps: EvilType.Validator.isArray(isBuildTarget), });
    export const rootValidatorObject: EvilType.Validator.ObjectValidator<Root> = ({ $schema: EvilType.Validator.isJust(
        "https://raw.githubusercontent.com/wraith13/build.js/master/generated/json-schema.json#" as const), modes:
        EvilType.Validator.isDictionaryObject(isMode), });
}
