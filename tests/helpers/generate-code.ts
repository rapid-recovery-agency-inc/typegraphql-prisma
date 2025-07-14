import path from "path";
import fs from "fs";
import { Project } from "ts-morph";
import { parseEnvValue } from "@prisma/internals";
import { getDMMF } from "@prisma/internals";

import generateCode from "../../src/generator/generate-code";
import { GeneratorOptions } from "../../src/generator/options";

/**
 * Helper function to generate code from a Prisma schema for testing purposes
 */
export async function generateCodeFromSchema(
  schema: string,
  outputDirPath: string,
  options: Partial<GeneratorOptions>
): Promise<Array<{ path: string; content: string }>> {
  // Create temp schema file
  const tempSchemaPath = path.join(outputDirPath, "schema.prisma");
  fs.writeFileSync(tempSchemaPath, schema);
  
  // Parse DMMF
  const dmmf = await getDMMF({
    datamodel: schema,
  });
  
  // Create output directory if it doesn't exist
  fs.mkdirSync(outputDirPath, { recursive: true });
  
  // Set default options
  const defaultOptions: GeneratorOptions = {
    emitDMMF: false,
    emitTranspiledCode: false,
    simpleResolvers: false,
    useOriginalMapping: false,
    useUncheckedScalarInputs: false,
    emitIdAsIDType: false,
    emitOnly: ["models", "enums", "inputs"],
    useSimpleInputs: false,
    emitRedundantTypesInfo: false,
    customPrismaImportPath: null,
    contextPrismaKey: null,
    omitInputFieldsByDefault: [],
    omitOutputFieldsByDefault: [],
    formatGeneratedCode: false,
    emitIsAbstract: false,
    outputDirPath,
    prismaClientPath: "./client",
    relativePrismaOutputPath: "../../client",
    absolutePrismaOutputPath: null,
  };
  
  // Merge options
  const mergedOptions: GeneratorOptions = { ...defaultOptions, ...options };
  
  // Generate code
  await generateCode(dmmf, mergedOptions);
  
  // Create a new project to read generated files
  const project = new Project();
  
  // Read all generated files
  const files = [];
  for (const filePath of getFilesRecursively(outputDirPath)) {
    const relativePath = path.relative(outputDirPath, filePath);
    const content = fs.readFileSync(filePath, "utf8");
    files.push({
      path: relativePath,
      content,
    });
  }
  
  return files;
}

function getFilesRecursively(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  
  return files;
}
