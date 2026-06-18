"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
const tslib_1 = require("tslib");
const internals_1 = require("@prisma/internals");
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
const generate_code_1 = tslib_1.__importDefault(require("../generator/generate-code"));
const removeDir_1 = tslib_1.__importDefault(require("../utils/removeDir"));
const emit_block_1 = require("../generator/emit-block");
const helpers_1 = require("./helpers");
async function generate(options) {
    const outputDir = (0, internals_1.parseEnvValue)(options.generator.output);
    await fs_1.promises.mkdir(outputDir, { recursive: true });
    await (0, removeDir_1.default)(outputDir, true);
    const CLIENT_PROVIDERS = ["prisma-client-js", "prisma-client"];
    const prismaClientProvider = options.otherGenerators.find(it => CLIENT_PROVIDERS.includes((0, internals_1.parseEnvValue)(it.provider)));
    const prismaClientPath = (0, internals_1.parseEnvValue)(prismaClientProvider.output);
    const prismaClientDmmf = await (0, internals_1.getDMMF)({
        datamodel: options.datamodel,
        // previewFeatures: prismaClientProvider.previewFeatures,
    });
    const generatorConfig = options.generator.config;
    // TODO: make this type `?-` and `| undefined`
    const externalConfig = {
        emitDMMF: (0, helpers_1.parseStringBoolean)(generatorConfig.emitDMMF),
        emitTranspiledCode: (0, helpers_1.parseStringBoolean)(generatorConfig.emitTranspiledCode),
        simpleResolvers: (0, helpers_1.parseStringBoolean)(generatorConfig.simpleResolvers),
        useOriginalMapping: (0, helpers_1.parseStringBoolean)(generatorConfig.useOriginalMapping),
        useUncheckedScalarInputs: (0, helpers_1.parseStringBoolean)(generatorConfig.useUncheckedScalarInputs),
        emitIdAsIDType: (0, helpers_1.parseStringBoolean)(generatorConfig.emitIdAsIDType),
        emitOnly: (0, helpers_1.parseStringArray)(generatorConfig.emitOnly, "emitOnly", emit_block_1.ALL_EMIT_BLOCK_KINDS),
        useSimpleInputs: (0, helpers_1.parseStringBoolean)(generatorConfig.useSimpleInputs),
        emitRedundantTypesInfo: (0, helpers_1.parseStringBoolean)(generatorConfig.emitRedundantTypesInfo),
        customPrismaImportPath: (0, helpers_1.parseString)(generatorConfig.customPrismaImportPath, "customPrismaImportPath"),
        contextPrismaKey: (0, helpers_1.parseString)(generatorConfig.contextPrismaKey, "contextPrismaKey"),
        omitInputFieldsByDefault: (0, helpers_1.parseStringArray)(generatorConfig.omitInputFieldsByDefault, "omitInputFieldsByDefault"),
        omitOutputFieldsByDefault: (0, helpers_1.parseStringArray)(generatorConfig.omitOutputFieldsByDefault, "omitOutputFieldsByDefault"),
        formatGeneratedCode: (0, helpers_1.parseStringBoolean)(generatorConfig.formatGeneratedCode) ??
            (0, helpers_1.parseStringEnum)(generatorConfig.formatGeneratedCode, "formatGeneratedCode", ["prettier", "tsc"]),
        emitIsAbstract: (0, helpers_1.parseStringBoolean)(generatorConfig.emitIsAbstract) ?? false,
    };
    const internalConfig = {
        outputDirPath: outputDir,
        prismaClientPath,
    };
    if (externalConfig.emitDMMF) {
        await Promise.all([
            fs_1.promises.writeFile(path_1.default.resolve(outputDir, "./dmmf.json"), JSON.stringify(options.dmmf, null, 2)),
            fs_1.promises.writeFile(path_1.default.resolve(outputDir, "./prisma-client-dmmf.json"), JSON.stringify(prismaClientDmmf, null, 2)),
        ]);
    }
    // TODO: replace with `options.dmmf` when the spec match prisma client output
    await (0, generate_code_1.default)(prismaClientDmmf, {
        ...externalConfig,
        ...internalConfig,
    });
    return "";
}
//# sourceMappingURL=prisma-generator.js.map