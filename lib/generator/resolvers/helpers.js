"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCrudResolverClassMethodDeclaration = generateCrudResolverClassMethodDeclaration;
const ts_morph_1 = require("ts-morph");
const types_1 = require("../dmmf/types");
function generateCrudResolverClassMethodDeclaration(action, mapping, dmmfDocument, generatorOptions) {
    return {
        name: action.name,
        isAsync: true,
        returnType: `Promise<${action.returnTSType}>`,
        decorators: [
            {
                name: `TypeGraphQL.${action.operation}`,
                arguments: [
                    `_returns => ${action.typeGraphQLType}`,
                    ts_morph_1.Writers.object({
                        nullable: `${!action.method.isRequired}`,
                    }),
                ],
            },
        ],
        parameters: [
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
            ...(!action.argsTypeName
                ? []
                : [
                    {
                        name: "args",
                        type: action.argsTypeName,
                        decorators: [
                            {
                                name: "TypeGraphQL.Args",
                                arguments: generatorOptions.emitRedundantTypesInfo
                                    ? [`_type => ${action.argsTypeName}`]
                                    : [],
                            },
                        ],
                    },
                ]),
        ],
        statements: action.kind === types_1.DMMF.ModelAction.aggregate
            ? [
                /* ts */ ` return getPrismaFromContext(ctx).${mapping.collectionName}.${action.prismaMethod}({
              ...args,
              ...transformInfoIntoPrismaArgs(info),
            });`,
            ]
            : action.kind === types_1.DMMF.ModelAction.groupBy
                ? [
                    /* ts */ ` const { _count, _avg, _sum, _min, _max } = transformInfoIntoPrismaArgs(info);`,
                    /* ts */ ` return getPrismaFromContext(ctx).${mapping.collectionName}.${action.prismaMethod}({
              ...args,
              ...Object.fromEntries(
                Object.entries({ _count, _avg, _sum, _min, _max }).filter(([_, v]) => v != null)
              ),
            });`,
                ]
                : [
                    /* ts */ ` const { _count } = transformInfoIntoPrismaArgs(info);
            return getPrismaFromContext(ctx).${mapping.collectionName}.${action.prismaMethod}({
              ...args,
              ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
            });`,
                ],
    };
}
//# sourceMappingURL=helpers.js.map