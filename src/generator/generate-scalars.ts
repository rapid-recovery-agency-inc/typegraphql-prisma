import { SourceFile } from "ts-morph";
import {
  generateGraphQLScalarTypeImport,
  generateGraphQLScalarsImport,
  generatePrismaNamespaceImport,
} from "./imports";

import { GeneratorOptions } from "./options";

export function generateCustomScalars(
  sourceFile: SourceFile,
  options: GeneratorOptions,
) {
  generatePrismaNamespaceImport(sourceFile, options);
  generateGraphQLScalarTypeImport(sourceFile);
  generateGraphQLScalarsImport(sourceFile);

  sourceFile.addStatements(/* ts */ `
    export const DecimalJSScalar = new GraphQLScalarType({
      name: "Decimal",
      description: "GraphQL Scalar representing the Prisma.Decimal type, based on Decimal.js library.",
      serialize: (value: unknown) => {
        if (!(Prisma.Decimal.isDecimal(value))) {
          throw new Error(\`[DecimalError] Invalid argument: \${Object.prototype.toString.call(value)}. Expected Prisma.Decimal.\`);
        }
        return (value as Prisma.Decimal).toString();
      },
      parseValue: (value: unknown) => {
        if (!(typeof value === "string")) {
          throw new Error(\`[DecimalError] Invalid argument: \${typeof value}. Expected string.\`);
        }
        return new Prisma.Decimal(value);
      },
    });

    const byteResolverConfig = GraphQLScalars.ByteResolver.toConfig();

    export const PrismaBytesScalar = new GraphQLScalarType({
      ...byteResolverConfig,
      serialize: (value: unknown) =>
        byteResolverConfig.serialize(value instanceof Uint8Array ? Buffer.from(value) : value),
    });
  `);
}
