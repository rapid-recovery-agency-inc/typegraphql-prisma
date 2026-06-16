"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArgsImports = exports.generateResolversOutputsImports = exports.generateOutputsImports = exports.generateInputsImports = exports.generateEnumsImports = exports.generateModelsImports = void 0;
exports.generateTypeGraphQLImport = generateTypeGraphQLImport;
exports.generateGraphQLFieldsImport = generateGraphQLFieldsImport;
exports.generateGraphQLInfoImport = generateGraphQLInfoImport;
exports.generateGraphQLScalarsImport = generateGraphQLScalarsImport;
exports.generateGraphQLScalarTypeImport = generateGraphQLScalarTypeImport;
exports.generateCustomScalarsImport = generateCustomScalarsImport;
exports.generateHelpersFileImport = generateHelpersFileImport;
exports.generatePrismaNamespaceImport = generatePrismaNamespaceImport;
exports.generateArgsBarrelFile = generateArgsBarrelFile;
exports.generateArgsIndexFile = generateArgsIndexFile;
exports.generateModelsBarrelFile = generateModelsBarrelFile;
exports.generateEnumsBarrelFile = generateEnumsBarrelFile;
exports.generateInputsBarrelFile = generateInputsBarrelFile;
exports.generateOutputsBarrelFile = generateOutputsBarrelFile;
exports.generateIndexFile = generateIndexFile;
exports.generateResolversBarrelFile = generateResolversBarrelFile;
exports.generateResolversActionsBarrelFile = generateResolversActionsBarrelFile;
exports.generateResolversIndexFile = generateResolversIndexFile;
const tslib_1 = require("tslib");
const ts_morph_1 = require("ts-morph");
const path_1 = tslib_1.__importDefault(require("path"));
const config_1 = require("./config");
function generateTypeGraphQLImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "type-graphql",
        namespaceImport: "TypeGraphQL",
    });
}
function generateGraphQLFieldsImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "graphql-fields",
        defaultImport: "graphqlFields",
    });
}
function generateGraphQLInfoImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "graphql",
        isTypeOnly: true,
        namedImports: ["GraphQLResolveInfo"],
    });
}
function generateGraphQLScalarsImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "graphql-scalars",
        namespaceImport: "GraphQLScalars",
    });
}
function generateGraphQLScalarTypeImport(sourceFile) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: "graphql",
        namedImports: ["GraphQLScalarType"],
    });
}
function generateCustomScalarsImport(sourceFile, level = 0) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: (level === 0 ? "./" : "") +
            path_1.default.posix.join(...Array(level).fill(".."), "scalars"),
        namedImports: ["DecimalJSScalar"],
    });
}
function generateHelpersFileImport(sourceFile, level = 0) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: (level === 0 ? "./" : "") +
            path_1.default.posix.join(...Array(level).fill(".."), "helpers"),
        namedImports: [
            "transformInfoIntoPrismaArgs",
            "getPrismaFromContext",
            "transformCountFieldIntoSelectRelationsCount",
        ],
    });
}
function generatePrismaNamespaceImport(sourceFile, options, level = 0) {
    sourceFile.addImportDeclaration({
        moduleSpecifier: options.absolutePrismaOutputPath ??
            (level === 0 ? "./" : "") +
                path_1.default.posix.join(...Array(level).fill(".."), options.customPrismaImportPath ?? options.relativePrismaOutputPath),
        namedImports: ["Prisma"],
    });
}
function generateArgsBarrelFile(sourceFile, argsTypeNames) {
    sourceFile.addExportDeclarations(argsTypeNames
        .sort()
        .map(argTypeName => ({
        moduleSpecifier: `./${argTypeName}`,
        namedExports: [argTypeName],
    })));
}
function generateArgsIndexFile(sourceFile, typeNames) {
    sourceFile.addExportDeclarations(typeNames
        .sort()
        .map(typeName => ({
        moduleSpecifier: `./${typeName}/args`,
    })));
}
function generateModelsBarrelFile(sourceFile, modelNames) {
    sourceFile.addExportDeclarations(modelNames
        .sort()
        .map(modelName => ({
        moduleSpecifier: `./${modelName}`,
        namedExports: [modelName],
    })));
}
function generateEnumsBarrelFile(sourceFile, enumTypeNames) {
    sourceFile.addExportDeclarations(enumTypeNames
        .sort()
        .map(enumTypeName => ({
        moduleSpecifier: `./${enumTypeName}`,
        namedExports: [enumTypeName],
    })));
}
function generateInputsBarrelFile(sourceFile, inputTypeNames) {
    sourceFile.addExportDeclarations(inputTypeNames
        .sort()
        .map(inputTypeName => ({
        moduleSpecifier: `./${inputTypeName}`,
        namedExports: [inputTypeName],
    })));
}
function generateOutputsBarrelFile(sourceFile, outputTypeNames, hasSomeArgs) {
    sourceFile.addExportDeclarations(outputTypeNames
        .sort()
        .map(outputTypeName => ({
        moduleSpecifier: `./${outputTypeName}`,
        namedExports: [outputTypeName],
    })));
    if (hasSomeArgs) {
        sourceFile.addExportDeclaration({ moduleSpecifier: `./${config_1.argsFolderName}` });
    }
}
function generateIndexFile(sourceFile, hasSomeRelations, blocksToEmit) {
    if (blocksToEmit.includes("enums")) {
        sourceFile.addExportDeclaration({
            moduleSpecifier: `./${config_1.enumsFolderName}`,
        });
    }
    if (blocksToEmit.includes("models")) {
        sourceFile.addExportDeclaration({
            moduleSpecifier: `./${config_1.modelsFolderName}`,
        });
    }
    if (blocksToEmit.includes("crudResolvers")) {
        sourceFile.addExportDeclaration({
            moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.crudResolversFolderName}`,
        });
        sourceFile.addImportDeclaration({
            moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.crudResolversFolderName}/resolvers-crud.index`,
            namespaceImport: "crudResolversImport",
        });
        sourceFile.addVariableStatement({
            isExported: true,
            declarationKind: ts_morph_1.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "crudResolvers",
                    initializer: `Object.values(crudResolversImport) as unknown as NonEmptyArray<Function>`,
                },
            ],
        });
    }
    if (hasSomeRelations && blocksToEmit.includes("relationResolvers")) {
        sourceFile.addExportDeclaration({
            moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.relationsResolversFolderName}`,
        });
        sourceFile.addImportDeclaration({
            moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.relationsResolversFolderName}/resolvers.index`,
            namespaceImport: "relationResolversImport",
        });
        sourceFile.addVariableStatement({
            isExported: true,
            declarationKind: ts_morph_1.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "relationResolvers",
                    initializer: `Object.values(relationResolversImport) as unknown as NonEmptyArray<Function>`,
                },
            ],
        });
    }
    if (blocksToEmit.includes("inputs")) {
        sourceFile.addExportDeclaration({
            moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.inputsFolderName}`,
        });
    }
    if (blocksToEmit.includes("outputs")) {
        sourceFile.addExportDeclaration({
            moduleSpecifier: `./${config_1.resolversFolderName}/${config_1.outputsFolderName}`,
        });
    }
    sourceFile.addExportDeclarations([
        { moduleSpecifier: `./enhance` },
        { moduleSpecifier: `./scalars` },
    ]);
    sourceFile.addImportDeclarations([
        {
            moduleSpecifier: `type-graphql`,
            namedImports: ["NonEmptyArray"],
        },
    ]);
    if (blocksToEmit.includes("crudResolvers") ||
        (hasSomeRelations && blocksToEmit.includes("relationResolvers")))
        sourceFile.addVariableStatement({
            isExported: true,
            declarationKind: ts_morph_1.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "resolvers",
                    initializer: `[
            ${blocksToEmit.includes("crudResolvers") ? "...crudResolvers," : ""}
            ${hasSomeRelations && blocksToEmit.includes("relationResolvers")
                        ? "...relationResolvers,"
                        : ""}
            ] as unknown as NonEmptyArray<Function>`,
                },
            ],
        });
}
function generateResolversBarrelFile(sourceFile, resolversData) {
    resolversData
        .sort((a, b) => a.modelName > b.modelName ? 1 : a.modelName < b.modelName ? -1 : 0)
        .forEach(({ modelName, resolverName }) => {
        sourceFile.addExportDeclaration({
            moduleSpecifier: `./${modelName}/${resolverName}`,
            namedExports: [resolverName],
        });
    });
}
function generateResolversActionsBarrelFile(sourceFile, resolversData) {
    resolversData
        .sort((a, b) => a.modelName > b.modelName ? 1 : a.modelName < b.modelName ? -1 : 0)
        .forEach(({ modelName, actionResolverNames }) => {
        if (actionResolverNames) {
            actionResolverNames.forEach(actionResolverName => {
                sourceFile.addExportDeclaration({
                    moduleSpecifier: `./${modelName}/${actionResolverName}`,
                    namedExports: [actionResolverName],
                });
            });
        }
    });
}
function generateResolversIndexFile(sourceFile, type, hasSomeArgs) {
    if (type === "crud") {
        sourceFile.addExportDeclarations([
            { moduleSpecifier: `./resolvers-actions.index` },
            { moduleSpecifier: `./resolvers-crud.index` },
        ]);
    }
    else {
        sourceFile.addExportDeclarations([
            { moduleSpecifier: `./resolvers.index` },
        ]);
    }
    if (hasSomeArgs) {
        sourceFile.addExportDeclarations([{ moduleSpecifier: `./args.index` }]);
    }
}
exports.generateModelsImports = createImportGenerator(config_1.modelsFolderName);
exports.generateEnumsImports = createImportGenerator(config_1.enumsFolderName);
exports.generateInputsImports = createImportGenerator(config_1.inputsFolderName);
exports.generateOutputsImports = createImportGenerator(config_1.outputsFolderName);
// TODO: unify with generateOutputsImports
exports.generateResolversOutputsImports = createImportGenerator(`${config_1.resolversFolderName}/${config_1.outputsFolderName}`);
exports.generateArgsImports = createImportGenerator(config_1.argsFolderName);
function createImportGenerator(elementsDirName) {
    return (sourceFile, elementsNames, level = 1) => {
        const distinctElementsNames = [...new Set(elementsNames)].sort();
        for (const elementName of distinctElementsNames) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: (level === 0 ? "./" : "") +
                    path_1.default.posix.join(...Array(level).fill(".."), elementsDirName, elementName),
                // TODO: refactor to default exports
                // defaultImport: elementName,
                namedImports: [elementName],
            });
        }
    };
}
//# sourceMappingURL=imports.js.map