"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputOmitSetting = exports.crudResolversFolderName = exports.relationsResolversFolderName = exports.argsFolderName = exports.resolversFolderName = exports.outputsFolderName = exports.inputsFolderName = exports.enumsFolderName = exports.modelsFolderName = exports.supportedMutationActions = exports.supportedQueryActions = exports.baseKeys = void 0;
exports.baseKeys = ["modelName"];
exports.supportedQueryActions = [
    "findUnique",
    "findUniqueOrThrow",
    "findFirst",
    "findFirstOrThrow",
    "findMany",
    "aggregate",
    "groupBy",
];
exports.supportedMutationActions = [
    "createOne",
    "createMany",
    "createManyAndReturn",
    "deleteOne",
    "updateOne",
    "deleteMany",
    "updateMany",
    "upsertOne",
];
exports.modelsFolderName = "models";
exports.enumsFolderName = "enums";
exports.inputsFolderName = "inputs";
exports.outputsFolderName = "outputs";
exports.resolversFolderName = "resolvers";
exports.argsFolderName = "args";
exports.relationsResolversFolderName = "relations";
exports.crudResolversFolderName = "crud";
var InputOmitSetting;
(function (InputOmitSetting) {
    InputOmitSetting["Create"] = "create";
    InputOmitSetting["Update"] = "update";
    InputOmitSetting["Where"] = "where";
    InputOmitSetting["OrderBy"] = "orderBy";
})(InputOmitSetting || (exports.InputOmitSetting = InputOmitSetting = {}));
//# sourceMappingURL=config.js.map