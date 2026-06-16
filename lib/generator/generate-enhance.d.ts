import { SourceFile } from "ts-morph";
import { DmmfDocument } from "./dmmf/dmmf-document";
import { DMMF } from "./dmmf/types";
export declare function generateEnhanceMap(sourceFile: SourceFile, dmmfDocument: DmmfDocument, modelMappings: readonly DMMF.ModelMapping[], relationModels: readonly DMMF.RelationModel[], models: readonly DMMF.Model[], inputs: readonly DMMF.InputType[], outputs: readonly DMMF.OutputType[]): void;
