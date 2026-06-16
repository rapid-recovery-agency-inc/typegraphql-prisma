import { DMMF } from "./dmmf/types";
export type BaseKeys = keyof Pick<DMMF.ModelMapping, "modelName">;
export declare const baseKeys: BaseKeys[];
export type ModelKeys = keyof Exclude<DMMF.ModelMapping, BaseKeys>;
export declare const supportedQueryActions: ("findUnique" | "findUniqueOrThrow" | "findFirst" | "findFirstOrThrow" | "findMany" | "groupBy" | "aggregate")[];
export type SupportedQueries = (typeof supportedQueryActions)[number];
export declare const supportedMutationActions: ("createOne" | "createMany" | "createManyAndReturn" | "updateOne" | "updateMany" | "upsertOne" | "deleteOne" | "deleteMany")[];
export type SupportedMutations = (typeof supportedMutationActions)[number];
export declare const modelsFolderName = "models";
export declare const enumsFolderName = "enums";
export declare const inputsFolderName = "inputs";
export declare const outputsFolderName = "outputs";
export declare const resolversFolderName = "resolvers";
export declare const argsFolderName = "args";
export declare const relationsResolversFolderName = "relations";
export declare const crudResolversFolderName = "crud";
export declare enum InputOmitSetting {
    Create = "create",
    Update = "update",
    Where = "where",
    OrderBy = "orderBy"
}
