"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DmmfDocument = void 0;
const transform_1 = require("./transform");
class DmmfDocument {
    constructor({ datamodel, schema, mappings }, options) {
        this.options = options;
        const enumTypes = [
            ...(schema.enumTypes.prisma ?? []),
            ...(schema.enumTypes.model ?? []),
        ];
        const models = [...datamodel.models, ...datamodel.types];
        // transform bare model without fields
        this.models = models.map(transform_1.transformBareModel);
        // transform enums before model fields to map enum types to enum values string union
        this.enums = enumTypes.map((0, transform_1.transformEnums)(this));
        // then transform once again to map the fields (it requires mapped model type names)
        this.models = models.map((0, transform_1.transformModelWithFields)(this));
        // transform enums again to map renamed fields
        this.enums = enumTypes.map((0, transform_1.transformEnums)(this));
        this.datamodel = {
            models: this.models,
            enums: datamodel.enums.map((0, transform_1.transformEnums)(this)),
            types: [], // TODO: parse `datamodel.types`
        };
        this.schema = {
            ...(0, transform_1.transformSchema)(schema, this),
            enums: this.enums,
        };
        this.modelMappings = (0, transform_1.transformMappings)(mappings.modelOperations, this, options);
        this.relationModels = this.models
            .filter(model => model.fields.some(field => field.relationName !== undefined && !field.isOmitted.output))
            .filter(model => {
            const outputType = this.schema.outputTypes.find(type => type.name === model.name);
            return (outputType &&
                outputType.fields.some(outputTypeField => model.fields.some(modelField => modelField.name === outputTypeField.name &&
                    modelField.relationName !== undefined &&
                    !modelField.isOmitted.output)));
        })
            .map((0, transform_1.generateRelationModel)(this));
    }
    getModelTypeName(modelName) {
        return this.models.find(it => it.name.toLocaleLowerCase() === modelName.toLocaleLowerCase())?.typeName;
    }
    isModelName(typeName) {
        return this.models.some(it => it.name === typeName);
    }
    isModelTypeName(typeName) {
        return this.models.some(it => it.typeName === typeName);
    }
    getModelFieldAlias(modelName, fieldName) {
        const model = this.models.find(it => it.name === modelName);
        return model?.fields.find(it => it.name === fieldName)?.typeFieldAlias;
    }
    shouldGenerateBlock(block) {
        return this.options.blocksToEmit.includes(block);
    }
}
exports.DmmfDocument = DmmfDocument;
//# sourceMappingURL=dmmf-document.js.map