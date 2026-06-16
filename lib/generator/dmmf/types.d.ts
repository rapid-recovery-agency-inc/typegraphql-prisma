import { InputOmitSetting } from "../config";
export type ReadonlyDeep<O> = {
    +readonly [K in keyof O]: ReadonlyDeep<O[K]>;
};
export declare namespace DMMF {
    type Document = ReadonlyDeep<{
        datamodel: Datamodel;
        schema: Schema;
        modelMappings: ModelMapping[];
    }>;
    type Enum = ReadonlyDeep<{
        name: string;
        dbName?: string | null;
        typeName: string;
        docs: string | undefined;
        valuesMap: Array<{
            name: string;
            value: string;
        }>;
    }>;
    type Datamodel = ReadonlyDeep<{
        models: Model[];
        enums: Enum[];
        types: Model[];
    }>;
    type UniqueIndex = ReadonlyDeep<{
        name: string;
        fields: string[];
    }>;
    type PrimaryKey = ReadonlyDeep<{
        name: string | null;
        fields: string[];
    }>;
    type Model = ReadonlyDeep<{
        name: string;
        dbName: string | null;
        fields: ModelField[];
        uniqueFields: string[][];
        uniqueIndexes: UniqueIndex[];
        primaryKey: PrimaryKey | null;
        typeName: string;
        docs: string | undefined;
        plural: string | undefined;
        isOmitted: {
            output: boolean;
        };
    }>;
    type FieldKind = "scalar" | "object" | "enum" | "unsupported";
    type FieldNamespace = "model" | "prisma";
    type FieldLocation = "scalar" | "inputObjectTypes" | "outputObjectTypes" | "enumTypes" | "fieldRefTypes";
    type ModelField = ReadonlyDeep<{
        name: string;
        isRequired: boolean;
        isList: boolean;
        isUnique: boolean;
        isId: boolean;
        isReadOnly: boolean;
        isGenerated?: boolean;
        isUpdatedAt?: boolean;
        dbNames?: string[] | null;
        hasDefaultValue: boolean;
        default?: FieldDefault | FieldDefaultScalar | FieldDefaultScalar[];
        relationFromFields?: string[];
        relationToFields?: string[];
        relationOnDelete?: string;
        relationName?: string;
        type: string;
        location: FieldLocation;
        typeFieldAlias?: string;
        typeGraphQLType: string;
        fieldTSType: string;
        docs: string | undefined;
        isOmitted: {
            input: boolean | InputOmitSetting[];
            output: boolean;
        };
    }>;
    type FieldDefault = ReadonlyDeep<{
        name: string;
        args: Array<string | number>;
    }>;
    type FieldDefaultScalar = string | boolean | number;
    type Schema = ReadonlyDeep<{
        rootQueryType?: string;
        rootMutationType?: string;
        inputTypes: InputType[];
        outputTypes: OutputType[];
        enums: Enum[];
    }>;
    type Query = ReadonlyDeep<{
        name: string;
        args: SchemaArg[];
        output: QueryOutput;
    }>;
    type QueryOutput = ReadonlyDeep<{
        name: string;
        isRequired: boolean;
        isList: boolean;
    }>;
    type TypeRef<AllowedLocations extends FieldLocation> = {
        isList: boolean;
        type: string;
        location: AllowedLocations;
        namespace?: FieldNamespace;
    };
    type InputTypeRef = TypeRef<"scalar" | "inputObjectTypes" | "enumTypes" | "fieldRefTypes">;
    type ArgType = string | InputType | Enum;
    type SchemaArgInputType = ReadonlyDeep<{
        isList: boolean;
        location: FieldLocation;
        namespace?: FieldNamespace;
        type: string;
    }>;
    type SchemaArg = ReadonlyDeep<{
        name: string;
        comment?: string;
        isNullable: boolean;
        isRequired: boolean;
        deprecation?: Deprecation;
        selectedInputType: SchemaArgInputType;
        typeName: string;
        typeGraphQLType: string;
        fieldTSType: string;
        hasMappedName: boolean;
        isOmitted: boolean;
    }>;
    type OutputType = ReadonlyDeep<{
        name: string;
        fields: OutputSchemaField[];
        typeName: string;
    }>;
    type SchemaField = ReadonlyDeep<{
        name: string;
        isNullable?: boolean;
        args: SchemaArg[];
        deprecation?: Deprecation;
        documentation?: string;
        outputType: TypeInfo;
        typeGraphQLType: string;
        fieldTSType: string;
        isRequired: boolean;
    }>;
    type OutputTypeRef = TypeRef<"scalar" | "outputObjectTypes" | "enumTypes">;
    type Deprecation = ReadonlyDeep<{
        sinceVersion: string;
        reason: string;
        plannedRemovalVersion?: string;
    }>;
    type TypeInfo = ReadonlyDeep<{
        isList: boolean;
        location: FieldLocation;
        namespace?: FieldNamespace;
        type: string;
    }>;
    type OutputSchemaField = SchemaField & ReadonlyDeep<{
        argsTypeName: string | undefined;
    }>;
    type InputType = ReadonlyDeep<{
        name: string;
        constraints: {
            maxNumFields: number | null;
            minNumFields: number | null;
        };
        meta?: {
            source?: string;
        };
        fields: SchemaArg[];
        typeName: string;
    }>;
    type FieldRefType = ReadonlyDeep<{
        name: string;
        allowTypes: FieldRefAllowType[];
        fields: SchemaArg[];
    }>;
    type FieldRefAllowType = TypeRef<"scalar" | "enumTypes">;
    type ModelMapping = ReadonlyDeep<{
        modelName: string;
        actions: Action[];
        collectionName: string;
        resolverName: string;
        modelTypeName: string;
    }>;
    enum ModelAction {
        findUnique = "findUnique",
        findUniqueOrThrow = "findUniqueOrThrow",
        findFirst = "findFirst",
        findFirstOrThrow = "findFirstOrThrow",
        findMany = "findMany",
        createOne = "createOne",
        createMany = "createMany",
        createManyAndReturn = "createManyAndReturn",
        updateOne = "updateOne",
        updateMany = "updateMany",
        upsertOne = "upsertOne",
        deleteOne = "deleteOne",
        deleteMany = "deleteMany",
        groupBy = "groupBy",
        aggregate = "aggregate",
        findRaw = "findRaw",
        aggregateRaw = "aggregateRaw"
    }
    type Action = ReadonlyDeep<{
        name: string;
        fieldName: string;
        kind: ModelAction;
        operation: "Query" | "Mutation";
        prismaMethod: string;
        method: OutputSchemaField;
        argsTypeName: string | undefined;
        outputTypeName: string;
        actionResolverName: string;
        returnTSType: string;
        typeGraphQLType: string;
    }>;
    type RelationModel = ReadonlyDeep<{
        model: Model;
        outputType: OutputType;
        relationFields: RelationField[];
        resolverName: string;
    }>;
    type RelationField = ModelField & ReadonlyDeep<{
        outputTypeField: OutputSchemaField;
        argsTypeName: string | undefined;
    }>;
}
