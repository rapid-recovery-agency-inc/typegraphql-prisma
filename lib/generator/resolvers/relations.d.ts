import { Project } from "ts-morph";
import { DmmfDocument } from "../dmmf/dmmf-document";
import { DMMF } from "../dmmf/types";
import { GeneratorOptions } from "../options";
export default function generateRelationsResolverClassesFromModel(project: Project, baseDirPath: string, dmmfDocument: DmmfDocument, { model, relationFields, resolverName }: DMMF.RelationModel, generatorOptions: GeneratorOptions): void;
