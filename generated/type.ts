import { EvilType } from "../evil-type.ts/common/evil-type";
export { EvilType };
export namespace Type
{
    export interface BuildTextPathValue
    {
        path: string;
        replace?: { match: string; text: BuildValueType; };
    }
    export interface BuildBinaryPathValue
    {
        path: string;
        encode: "base64" | "hex";
    }
    export type BuildPathValue = BuildTextPathValue | BuildBinaryPathValue;
    export interface BuildJsonValue
    {
        json: string;
        value?: string | (string[]);
    }
    export interface BuildCallValue
    {
        call: "command" | "command_options" | "timestamp" | "timestamp_tick";
    }
    export interface BuildResourceValue
    {
        resource: string;
        base?: string;
    }
    export type BuildValueType = string | BuildPathValue | BuildJsonValue | BuildCallValue | BuildResourceValue;
    export interface BuildModeBase
    {
        base: string;
        parameters?: { [ key: string ]: BuildValueType; } | BuildJsonValue;
    }
    export interface BuildPrimeTarget
    {
        template: BuildValueType;
        output: BuildPathValue;
        parameters?: { [ key: string ]: BuildValueType; } | BuildJsonValue;
    }
    export interface SinglePrimeBuildMode extends BuildModeBase, BuildPrimeTarget
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
        parameters: { [ key: string ]: BuildValueType; } | BuildJsonValue;
    }
    export type BuildTarget = BuildPrimeTarget | BuildProcessTarget | BuildReferenceTarget | BuildMetaTarget;
    export type SingleBuildMode = SinglePrimeBuildMode | BuildProcessTarget | BuildReferenceTarget | BuildMetaTarget;
    export interface MultiBuildMode extends BuildModeBase
    {
        steps: BuildTarget[];
        output: BuildPathValue;
    }
    export type Mode = SingleBuildMode | MultiBuildMode;
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
    export const isBuildJsonValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildJsonValueValidatorObject, {
        additionalProperties: false }));
    export const isBuildCallValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildCallValueValidatorObject, {
        additionalProperties: false }));
    export const isBuildResourceValue = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildResourceValueValidatorObject, {
        additionalProperties: false }));
    export const isBuildValueType: EvilType.Validator.IsType<BuildValueType> = EvilType.lazy(() => EvilType.Validator.isOr(
        EvilType.Validator.isString, isBuildPathValue, isBuildJsonValue, isBuildCallValue, isBuildResourceValue));
    export const isBuildModeBase = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildModeBaseValidatorObject, {
        additionalProperties: false }));
    export const isBuildPrimeTarget = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildPrimeTargetValidatorObject, {
        additionalProperties: false }));
    export const isSinglePrimeBuildMode = EvilType.lazy(() => EvilType.Validator.isSpecificObject(singlePrimeBuildModeValidatorObject, {
        additionalProperties: false }));
    export const isBuildProcessTarget = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildProcessTargetValidatorObject, {
        additionalProperties: false }));
    export const isBuildReferenceTarget = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildReferenceTargetValidatorObject, {
        additionalProperties: false }));
    export const isBuildMetaTarget = EvilType.lazy(() => EvilType.Validator.isSpecificObject(buildMetaTargetValidatorObject, {
        additionalProperties: false }));
    export const isBuildTarget: EvilType.Validator.IsType<BuildTarget> = EvilType.lazy(() => EvilType.Validator.isOr(isBuildPrimeTarget,
        isBuildProcessTarget, isBuildReferenceTarget, isBuildMetaTarget));
    export const isSingleBuildMode: EvilType.Validator.IsType<SingleBuildMode> = EvilType.lazy(() => EvilType.Validator.isOr(
        isSinglePrimeBuildMode, isBuildProcessTarget, isBuildReferenceTarget, isBuildMetaTarget));
    export const isMultiBuildMode = EvilType.lazy(() => EvilType.Validator.isSpecificObject(multiBuildModeValidatorObject, {
        additionalProperties: false }));
    export const isMode: EvilType.Validator.IsType<Mode> = EvilType.lazy(() => EvilType.Validator.isOr(isSingleBuildMode, isMultiBuildMode)
        );
    export const isRoot = EvilType.lazy(() => EvilType.Validator.isSpecificObject(rootValidatorObject, { additionalProperties: false }));
    export const buildTextPathValueValidatorObject: EvilType.Validator.ObjectValidator<BuildTextPathValue> = ({ path:
        EvilType.Validator.isString, replace: EvilType.Validator.isOptional(({ match: EvilType.Validator.isString, text: isBuildValueType,
        })), });
    export const buildBinaryPathValueValidatorObject: EvilType.Validator.ObjectValidator<BuildBinaryPathValue> = ({ path:
        EvilType.Validator.isString, encode: EvilType.Validator.isEnum([ "base64", "hex" ] as const), });
    export const buildJsonValueValidatorObject: EvilType.Validator.ObjectValidator<BuildJsonValue> = ({ json: EvilType.Validator.isString,
        value: EvilType.Validator.isOptional(EvilType.Validator.isOr(EvilType.Validator.isString, EvilType.Validator.isArray(
        EvilType.Validator.isString))), });
    export const buildCallValueValidatorObject: EvilType.Validator.ObjectValidator<BuildCallValue> = ({ call: EvilType.Validator.isEnum([
        "command", "command_options", "timestamp", "timestamp_tick" ] as const), });
    export const buildResourceValueValidatorObject: EvilType.Validator.ObjectValidator<BuildResourceValue> = ({ resource:
        EvilType.Validator.isString, base: EvilType.Validator.isOptional(EvilType.Validator.isString), });
    export const buildModeBaseValidatorObject: EvilType.Validator.ObjectValidator<BuildModeBase> = ({ base: EvilType.Validator.isString,
        parameters: EvilType.Validator.isOptional(EvilType.Validator.isOr(EvilType.Validator.isDictionaryObject(isBuildValueType),
        isBuildJsonValue)), });
    export const buildPrimeTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildPrimeTarget> = ({ template: isBuildValueType,
        output: isBuildPathValue, parameters: EvilType.Validator.isOptional(EvilType.Validator.isOr(EvilType.Validator.isDictionaryObject(
        isBuildValueType), isBuildJsonValue)), });
    export const singlePrimeBuildModeValidatorObject: EvilType.Validator.ObjectValidator<SinglePrimeBuildMode> =
        EvilType.Validator.mergeObjectValidator(buildModeBaseValidatorObject, buildPrimeTargetValidatorObject, { });
    export const buildProcessTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildProcessTarget> = ({ processes:
        EvilType.Validator.isOr(EvilType.Validator.isString, EvilType.Validator.isArray(EvilType.Validator.isString)), });
    export const buildReferenceTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildReferenceTarget> = ({ references:
        EvilType.Validator.isString, });
    export const buildMetaTargetValidatorObject: EvilType.Validator.ObjectValidator<BuildMetaTarget> = ({ meta: isBuildTarget, parameters:
        EvilType.Validator.isOr(EvilType.Validator.isDictionaryObject(isBuildValueType), isBuildJsonValue), });
    export const multiBuildModeValidatorObject: EvilType.Validator.ObjectValidator<MultiBuildMode> =
        EvilType.Validator.mergeObjectValidator(buildModeBaseValidatorObject, { steps: EvilType.Validator.isArray(isBuildTarget), output:
        isBuildPathValue, });
    export const rootValidatorObject: EvilType.Validator.ObjectValidator<Root> = ({ $schema: EvilType.Validator.isJust(
        "https://raw.githubusercontent.com/wraith13/build.js/master/generated/json-schema.json#" as const), modes:
        EvilType.Validator.isDictionaryObject(isMode), });
}
