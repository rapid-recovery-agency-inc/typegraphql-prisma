import { promises as fs } from "fs";
import path from "path";
import generateArtifactsDirPath from "../helpers/artifacts-dir";
import { generateCodeFromSchema } from "../helpers/generate-code";
import createReadGeneratedFile, {
  ReadGeneratedFile,
} from "../helpers/read-file";

describe("custom scalars", () => {
  let outputDirPath: string;
  let readGeneratedFile: ReadGeneratedFile;

  beforeEach(async () => {
    outputDirPath = generateArtifactsDirPath("scalars-regression");
    await fs.mkdir(outputDirPath, { recursive: true });
    readGeneratedFile = createReadGeneratedFile(outputDirPath);
  });

  it("should properly emit custom scalars file", async () => {
    const schema = /* prisma */ `
      model Sample {
        id    Int     @id @default(autoincrement())
        text  String
      }
    `;

    await generateCodeFromSchema(schema, { outputDirPath });
    const scalarsTSFile = await readGeneratedFile("/scalars.ts");
    const mainIndexTSFile = await readGeneratedFile("/index.ts");

    expect(scalarsTSFile).toMatchSnapshot("scalars");
    expect(scalarsTSFile).toContain("export const PrismaBytesScalar");
    expect(scalarsTSFile).toContain("...byteResolverConfig");
    expect(mainIndexTSFile).toMatchSnapshot("mainIndex");

    const { PrismaBytesScalar } = require(
      path.join(outputDirPath, "scalars.ts"),
    );
    const bytes = Uint8Array.from([1, 2, 3]);

    expect(PrismaBytesScalar.serialize(bytes)).toEqual(Buffer.from(bytes));
    expect(PrismaBytesScalar.serialize("AQID")).toEqual(Buffer.from(bytes));
    expect(PrismaBytesScalar.extensions).toMatchObject({
      codegenScalarType: "Buffer | string",
      jsonSchema: { format: "byte", type: "string" },
    });
  });
});
