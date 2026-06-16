"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformSchema = transformSchema;
exports.transformMappings = transformMappings;
exports.transformBareModel = transformBareModel;
exports.transformModelWithFields = transformModelWithFields;
exports.getMappedOutputTypeName = getMappedOutputTypeName;
exports.transformEnums = transformEnums;
exports.generateRelationModel = generateRelationModel;
const tslib_1 = require("tslib");
const types_1 = require("./types");
const helpers_1 = require("./helpers");
const helpers_2 = require("../helpers");
const pluralize_1 = tslib_1.__importDefault(require("pluralize"));
const config_1 = require("../config");
function transformSchema(datamodel, dmmfDocument) {
    const inputObjectTypes = [
        ...(datamodel.inputObjectTypes.prisma ?? []),
        ...(datamodel.inputObjectTypes.model ?? []),
    ];
    const outputObjectTypes = [
        ...(datamodel.outputObjectTypes.prisma ?? []),
        ...(datamodel.outputObjectTypes.model ?? []),
    ];
    return {
        inputTypes: inputObjectTypes
            .filter(uncheckedScalarInputsFilter(dmmfDocument))
            .map(transformInputType(dmmfDocument)),
        outputTypes: outputObjectTypes.map(transformOutputType(dmmfDocument)),
        rootMutationType: datamodel.rootMutationType,
        rootQueryType: datamodel.rootQueryType,
    };
}
function transformMappings(mapping, dmmfDocument, options) {
    return mapping.map(transformMapping(dmmfDocument, options));
}
function transformBareModel(model) {
    const attributeArgs = (0, helpers_1.parseDocumentationAttributes)(model.documentation, "type", "model");
    const { output = false } = (0, helpers_1.parseDocumentationAttributes)(model.documentation, "omit", "model");
    return {
        ...model,
        typeName: attributeArgs.name ?? (0, helpers_2.pascalCase)(model.name),
        fields: [],
        docs: (0, helpers_2.cleanDocsString)(model.documentation),
        plural: attributeArgs.plural,
        isOmitted: { output },
    };
}
function transformModelWithFields(dmmfDocument) {
    return (model) => {
        return {
            ...transformBareModel(model),
            fields: model.fields.map(transformModelField(dmmfDocument)),
        };
    };
}
function transformModelField(dmmfDocument) {
    const { omitInputFieldsByDefault, omitOutputFieldsByDefault } = dmmfDocument.options;
    return (field) => {
        const attributeArgs = (0, helpers_1.parseDocumentationAttributes)(field.documentation, "field", "field");
        const location = field.kind === "enum"
            ? "enumTypes"
            : field.kind === "object"
                ? "outputObjectTypes"
                : "scalar";
        if (typeof field.type !== "string") {
            throw new Error(`[Internal Generator Error] Unexpected 'field.type' value: "${field.type}""`);
        }
        const typeInfo = {
            location,
            isList: field.isList,
            type: dmmfDocument.isModelName(field.type)
                ? dmmfDocument.getModelTypeName(field.type)
                : field.type,
        };
        const fieldTSType = (0, helpers_2.getFieldTSType)(dmmfDocument, typeInfo, field.isRequired, false);
        const typeGraphQLType = (0, helpers_2.getTypeGraphQLType)(typeInfo, dmmfDocument, undefined, undefined, field.isId);
        const omitFieldAttribute = (0, helpers_1.parseDocumentationAttributes)(field.documentation, "omit", "field");
        return {
            ...field,
            type: field.type, // TS type check limitation
            location,
            typeFieldAlias: attributeArgs.name,
            fieldTSType,
            typeGraphQLType,
            docs: (0, helpers_2.cleanDocsString)(field.documentation),
            isOmitted: {
                input: omitFieldAttribute.input ??
                    omitInputFieldsByDefault?.includes(field.name) ??
                    false,
                output: omitFieldAttribute.output ??
                    omitOutputFieldsByDefault?.includes(field.name) ??
                    false,
            },
        };
    };
}
function uncheckedScalarInputsFilter(dmmfDocument) {
    const { useUncheckedScalarInputs } = dmmfDocument.options;
    return (inputType) => {
        return useUncheckedScalarInputs
            ? true
            : !inputType.name.includes("Unchecked");
    };
}
function transformInputType(dmmfDocument) {
    return (inputType) => {
        const modelName = (0, helpers_2.getModelNameFromInputType)(inputType.name);
        const modelType = modelName
            ? dmmfDocument.datamodel.models.find(it => it.name === modelName)
            : undefined;
        return {
            ...inputType,
            typeName: (0, helpers_2.getInputTypeName)(inputType.name, dmmfDocument),
            fields: inputType.fields
                .filter(field => field.deprecation === undefined)
                .map(field => {
                const modelField = modelType?.fields.find(it => it.name === field.name);
                const typeName = modelField?.typeFieldAlias ?? field.name;
                const selectedInputType = selectInputTypeFromTypes(dmmfDocument)(field.inputTypes);
                const typeGraphQLType = (0, helpers_2.getTypeGraphQLType)(selectedInputType, dmmfDocument);
                const fieldTSType = (0, helpers_2.getFieldTSType)(dmmfDocument, selectedInputType, field.isRequired, true);
                const isOmitted = !modelField?.isOmitted.input
                    ? false
                    : typeof modelField.isOmitted.input === "boolean"
                        ? modelField.isOmitted.input
                        : (modelField.isOmitted.input.includes(config_1.InputOmitSetting.Create) &&
                            inputType.name.includes("Create")) ||
                            (modelField.isOmitted.input.includes(config_1.InputOmitSetting.Update) &&
                                inputType.name.includes("Update")) ||
                            (modelField.isOmitted.input.includes(config_1.InputOmitSetting.Where) &&
                                inputType.name.includes("Where")) ||
                            (modelField.isOmitted.input.includes(config_1.InputOmitSetting.OrderBy) &&
                                inputType.name.includes("OrderBy"));
                return {
                    ...field,
                    selectedInputType,
                    typeName,
                    typeGraphQLType,
                    fieldTSType,
                    hasMappedName: field.name !== typeName,
                    isOmitted,
                };
            }),
        };
    };
}
function transformOutputType(dmmfDocument) {
    return (outputType) => {
        const typeName = getMappedOutputTypeName(dmmfDocument, outputType.name);
        return {
            ...outputType,
            typeName,
            fields: outputType.fields
                .filter(field => field.deprecation === undefined)
                .map(field => {
                const isFieldRequired = field.isNullable !== true && field.name !== "_count";
                const outputTypeInfo = {
                    ...field.outputType,
                    type: getMappedOutputTypeName(dmmfDocument, field.outputType.type),
                };
                const fieldTSType = (0, helpers_2.getFieldTSType)(dmmfDocument, outputTypeInfo, isFieldRequired, false);
                const typeGraphQLType = (0, helpers_2.getTypeGraphQLType)(outputTypeInfo, dmmfDocument);
                const args = field.args.map(arg => {
                    const selectedInputType = selectInputTypeFromTypes(dmmfDocument)(arg.inputTypes);
                    const typeGraphQLType = (0, helpers_2.getTypeGraphQLType)(selectedInputType, dmmfDocument);
                    const fieldTSType = (0, helpers_2.getFieldTSType)(dmmfDocument, selectedInputType, arg.isRequired, true);
                    return {
                        ...arg,
                        selectedInputType,
                        fieldTSType,
                        typeGraphQLType,
                        hasMappedName: arg.name !== typeName,
                        // TODO: add proper mapping in the future if needed
                        typeName: arg.name,
                        isOmitted: false,
                    };
                });
                const argsTypeName = args.length > 0
                    ? `${typeName}${(0, helpers_2.pascalCase)(field.name)}Args`
                    : undefined;
                return {
                    ...field,
                    isRequired: isFieldRequired,
                    outputType: outputTypeInfo,
                    fieldTSType,
                    typeGraphQLType,
                    args,
                    argsTypeName,
                };
            }),
        };
    };
}
function getMappedOutputTypeName(dmmfDocument, outputTypeName) {
    if (outputTypeName.startsWith("Aggregate")) {
        const modelTypeName = dmmfDocument.getModelTypeName(outputTypeName.replace("Aggregate", ""));
        return `Aggregate${modelTypeName}`;
    }
    if (outputTypeName.startsWith("CreateMany") &&
        outputTypeName.endsWith("AndReturnOutputType")) {
        const modelTypeName = dmmfDocument.getModelTypeName(outputTypeName
            .replace("CreateMany", "")
            .replace("AndReturnOutputType", ""));
        return `CreateManyAndReturn${modelTypeName}`;
    }
    if (dmmfDocument.isModelName(outputTypeName)) {
        return dmmfDocument.getModelTypeName(outputTypeName);
    }
    const dedicatedTypeSuffix = [
        "CountAggregateOutputType",
        "MinAggregateOutputType",
        "MaxAggregateOutputType",
        "AvgAggregateOutputType",
        "SumAggregateOutputType",
        "GroupByOutputType",
        "CountOutputType",
    ].find(type => outputTypeName.includes(type));
    if (dedicatedTypeSuffix) {
        const modelName = outputTypeName.replace(dedicatedTypeSuffix, "");
        const operationName = outputTypeName
            .replace(modelName, "")
            .replace("OutputType", "");
        return `${dmmfDocument.getModelTypeName(modelName)}${operationName}`;
    }
    return outputTypeName;
}
function transformMapping(dmmfDocument, options) {
    return (mapping) => {
        const { model: modelName, ...availableActions } = mapping;
        const modelTypeName = dmmfDocument.getModelTypeName(modelName) ?? modelName;
        const model = dmmfDocument.datamodel.models.find(it => it.name === modelName);
        const actions = Object.entries(availableActions)
            .sort(([a], [b]) => a.localeCompare(b))
            .filter(([actionKind, fieldName]) => fieldName && getOperationKindName(actionKind)).map(([modelAction, fieldName]) => {
            const kind = modelAction;
            const actionOutputType = dmmfDocument.schema.outputTypes.find(type => type.fields.some(field => field.name === fieldName));
            if (!actionOutputType) {
                throw new Error(`Cannot find type with field ${fieldName} in root types definitions!`);
            }
            const method = actionOutputType.fields.find(field => field.name === fieldName);
            const argsTypeName = method.args.length > 0
                ? getMappedArgsTypeName(kind, modelTypeName)
                : undefined;
            const outputTypeName = method.outputType.type;
            const actionResolverName = getMappedActionResolverName(kind, modelTypeName);
            const returnTSType = (0, helpers_2.getFieldTSType)(dmmfDocument, method.outputType, method.isRequired, false, mapping.model, modelTypeName);
            const typeGraphQLType = (0, helpers_2.getTypeGraphQLType)(method.outputType, dmmfDocument, mapping.model, modelTypeName);
            return {
                name: getMappedActionName(kind, modelTypeName, model.plural, options),
                fieldName,
                kind: kind,
                operation: getOperationKindName(kind),
                prismaMethod: getPrismaMethodName(kind),
                method,
                argsTypeName,
                outputTypeName,
                actionResolverName,
                returnTSType,
                typeGraphQLType,
            };
        });
        const resolverName = `${modelTypeName}CrudResolver`;
        return {
            modelName,
            modelTypeName,
            actions,
            collectionName: (0, helpers_2.camelCase)(mapping.model),
            resolverName,
        };
    };
}
function selectInputTypeFromTypes(dmmfDocument) {
    return (inputTypes) => {
        const { useUncheckedScalarInputs, useSimpleInputs } = dmmfDocument.options;
        let possibleInputTypes;
        possibleInputTypes = inputTypes.filter(it => it.location === "inputObjectTypes" &&
            // skip inputs with `set` and other fields when simple/flat inputs are enabled
            (!useSimpleInputs ||
                !(it.type.includes("OperationsInput") || // postgres specific
                    // mongo specific
                    it.type.includes("CreateEnvelopeInput") ||
                    /.+Create.+Input/.test(it.type) ||
                    /.+Update.+Input/.test(it.type))));
        if (possibleInputTypes.length === 0) {
            possibleInputTypes = inputTypes.filter(it => it.location === "scalar" && it.type !== "Null");
        }
        if (possibleInputTypes.length === 0) {
            possibleInputTypes = inputTypes.filter(it => it.location === "enumTypes");
        }
        if (possibleInputTypes.length === 0) {
            possibleInputTypes = inputTypes;
        }
        const selectedInputType = possibleInputTypes.find(it => it.isList) ||
            (useUncheckedScalarInputs &&
                possibleInputTypes.find(it => it.type.includes("Unchecked"))) ||
            possibleInputTypes[0];
        let inputType = selectedInputType.type;
        if (selectedInputType.location === "enumTypes") {
            const enumDef = dmmfDocument.enums.find(it => it.name === inputType);
            inputType = enumDef.typeName;
        }
        else if (selectedInputType.location === "inputObjectTypes") {
            inputType = (0, helpers_2.getInputTypeName)(inputType, dmmfDocument);
        }
        return {
            ...selectedInputType,
            type: inputType,
        };
    };
}
function getMappedActionName(actionName, typeName, overriddenPlural, options) {
    const defaultMappedActionName = mapDefaultActionName(actionName, typeName);
    if (options.useOriginalMapping) {
        return defaultMappedActionName;
    }
    const hasNoPlural = !overriddenPlural && typeName === (0, pluralize_1.default)(typeName);
    if (hasNoPlural) {
        return defaultMappedActionName;
    }
    switch (actionName) {
        case "findUnique": {
            return (0, helpers_2.camelCase)(typeName);
        }
        case "findUniqueOrThrow": {
            return `get${typeName}`;
        }
        case "findMany": {
            return (0, helpers_2.camelCase)(overriddenPlural ?? (0, pluralize_1.default)(typeName));
        }
        default: {
            return defaultMappedActionName;
        }
    }
}
function getMappedArgsTypeName(actionName, typeName) {
    return `${(0, helpers_2.pascalCase)(mapDefaultActionName(actionName, typeName))}Args`;
}
function getMappedActionResolverName(actionName, typeName) {
    return `${(0, helpers_2.pascalCase)(mapDefaultActionName(actionName, typeName))}Resolver`;
}
function mapDefaultActionName(actionName, typeName) {
    return actionName.includes("OrThrow")
        ? `${actionName.replace("OrThrow", "")}${typeName}OrThrow`
        : `${actionName}${typeName}`;
}
function getOperationKindName(actionName) {
    if (config_1.supportedQueryActions.includes(actionName)) {
        return "Query";
    }
    if (config_1.supportedMutationActions.includes(actionName)) {
        return "Mutation";
    }
    // throw new Error(`Unsupported operation kind: '${actionName}'`);
}
function getPrismaMethodName(actionKind) {
    switch (actionKind) {
        case types_1.DMMF.ModelAction.createOne:
            return "create";
        case types_1.DMMF.ModelAction.updateOne:
            return "update";
        case types_1.DMMF.ModelAction.upsertOne:
            return "upsert";
        case types_1.DMMF.ModelAction.deleteOne:
            return "delete";
        default:
            return actionKind;
    }
}
const ENUM_SUFFIXES = ["OrderByRelevanceFieldEnum", "ScalarFieldEnum"];
function transformEnums(dmmfDocument) {
    return (enumDef) => {
        let modelName = undefined;
        let typeName = enumDef.name;
        const detectedSuffix = ENUM_SUFFIXES.find(suffix => enumDef.name.endsWith(suffix));
        if (detectedSuffix) {
            modelName = enumDef.name.replace(detectedSuffix, "");
            typeName = `${dmmfDocument.getModelTypeName(modelName)}${detectedSuffix}`;
        }
        const enumValues = enumDef.values;
        return {
            ...enumDef,
            docs: "documentation" in enumDef
                ? (0, helpers_2.cleanDocsString)(enumDef.documentation)
                : undefined,
            typeName,
            valuesMap: enumValues.map(enumValue => {
                const enumValueName = typeof enumValue === "string" ? enumValue : enumValue.name;
                return {
                    value: enumValueName,
                    name: (modelName &&
                        dmmfDocument.getModelFieldAlias(modelName, enumValueName)) ||
                        enumValueName,
                };
            }),
        };
    };
}
function generateRelationModel(dmmfDocument) {
    return (model) => {
        const outputType = dmmfDocument.schema.outputTypes.find(type => type.name === model.name);
        const resolverName = `${model.typeName}RelationsResolver`;
        const relationFields = model.fields
            .filter(field => field.relationName &&
            !field.isOmitted.output &&
            outputType.fields.some(it => it.name === field.name))
            .map(field => {
            const outputTypeField = outputType.fields.find(it => it.name === field.name);
            const argsTypeName = outputTypeField.args.length > 0
                ? `${model.typeName}${(0, helpers_2.pascalCase)(field.name)}Args`
                : undefined;
            return {
                ...field,
                outputTypeField,
                argsTypeName,
                type: dmmfDocument.getModelTypeName(field.type),
            };
        });
        return {
            model,
            outputType,
            relationFields,
            resolverName,
        };
    };
}
//# sourceMappingURL=transform.js.map