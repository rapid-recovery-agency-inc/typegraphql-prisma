"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateRelationsResolverClassesFromModel;
const tslib_1 = require("tslib");
const ts_morph_1 = require("ts-morph");
const path_1 = tslib_1.__importDefault(require("path"));
const helpers_1 = require("../helpers");
const config_1 = require("../config");
const imports_1 = require("../imports");
function generateRelationsResolverClassesFromModel(project, baseDirPath, dmmfDocument, { model, relationFields, resolverName }, generatorOptions) {
    const rootArgName = (0, helpers_1.camelCase)(model.typeName);
    const singleIdField = model.fields.find(field => field.isId);
    const singleUniqueField = model.fields.find(field => field.isUnique);
    const singleFilterField = singleIdField ?? singleUniqueField;
    const compositeIdFields = model.primaryKey?.fields.map(idField => model.fields.find(field => idField === field.name)) ?? [];
    const compositeUniqueFields = model.uniqueIndexes[0]
        ? model.uniqueIndexes[0].fields.map(uniqueField => model.fields.find(field => uniqueField === field.name))
        : [];
    const compositeFilterFields = compositeIdFields.length > 0 ? compositeIdFields : compositeUniqueFields;
    const resolverDirPath = path_1.default.resolve(baseDirPath, config_1.resolversFolderName, config_1.relationsResolversFolderName, model.typeName);
    const filePath = path_1.default.resolve(resolverDirPath, `${resolverName}.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    (0, imports_1.generateTypeGraphQLImport)(sourceFile);
    (0, imports_1.generateGraphQLInfoImport)(sourceFile);
    (0, imports_1.generateModelsImports)(sourceFile, [...relationFields.map(field => field.type), model.typeName], 3);
    const argTypeNames = relationFields
        .filter(it => it.argsTypeName !== undefined)
        .map(it => it.argsTypeName);
    (0, imports_1.generateArgsImports)(sourceFile, argTypeNames, 0);
    (0, imports_1.generateHelpersFileImport)(sourceFile, 3);
    sourceFile.addClass({
        name: resolverName,
        isExported: true,
        decorators: [
            {
                name: "TypeGraphQL.Resolver",
                arguments: [`_of => ${model.typeName}`],
            },
        ],
        methods: relationFields.map(field => {
            let whereConditionString = "";
            // TODO: refactor to AST
            if (singleFilterField) {
                whereConditionString = `
            ${singleFilterField.name}: ${rootArgName}.${singleFilterField.name},
          `;
            }
            else if (compositeFilterFields.length > 0) {
                const filterKeyName = model.primaryKey?.name ??
                    model.uniqueIndexes[0]?.name ??
                    compositeFilterFields.map(it => it.name).join("_");
                whereConditionString = `
            ${filterKeyName}: {
              ${compositeFilterFields
                    .map(idField => `${idField.name}: ${rootArgName}.${idField.name},`)
                    .join("\n")}
            },
          `;
            }
            else {
                throw new Error(`Unexpected error happened on generating 'whereConditionString' for ${model.typeName} relation resolver`);
            }
            return {
                name: field.typeFieldAlias ?? field.name,
                isAsync: true,
                returnType: `Promise<${field.fieldTSType}>`,
                decorators: [
                    {
                        name: "TypeGraphQL.FieldResolver",
                        arguments: [
                            `_type => ${field.typeGraphQLType}`,
                            ts_morph_1.Writers.object({
                                nullable: `${!field.isRequired}`,
                                ...(field.docs && { description: `"${field.docs}"` }),
                            }),
                        ],
                    },
                ],
                parameters: [
                    {
                        name: rootArgName,
                        type: model.typeName,
                        decorators: [{ name: "TypeGraphQL.Root", arguments: [] }],
                    },
                    {
                        name: "ctx",
                        // TODO: import custom `ContextType`
                        type: "any",
                        decorators: [{ name: "TypeGraphQL.Ctx", arguments: [] }],
                    },
                    {
                        name: "info",
                        type: "GraphQLResolveInfo",
                        decorators: [{ name: "TypeGraphQL.Info", arguments: [] }],
                    },
                    ...(!field.argsTypeName
                        ? []
                        : [
                            {
                                name: "args",
                                type: field.argsTypeName,
                                decorators: [
                                    {
                                        name: "TypeGraphQL.Args",
                                        arguments: generatorOptions.emitRedundantTypesInfo
                                            ? [`_type => ${field.argsTypeName}`]
                                            : [],
                                    },
                                ],
                            },
                        ]),
                ],
                // TODO: refactor to AST
                statements: [
                    /* ts */ ` const { _count } = transformInfoIntoPrismaArgs(info);
            return getPrismaFromContext(ctx).${(0, helpers_1.camelCase)(model.name)}.findUniqueOrThrow({
              where: {${whereConditionString}},
            }).${field.name}({ ${field.argsTypeName ? "\n...args," : ""}
              ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
            });`,
                ],
            };
        }),
    });
}
//# sourceMappingURL=relations.js.map