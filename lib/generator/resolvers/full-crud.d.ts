import { Project } from "ts-morph";
import { DmmfDocument } from "../dmmf/dmmf-document";
import { DMMF } from "../dmmf/types";
import { GeneratorOptions } from "../options";
export default function generateCrudResolverClassFromMapping(project: Project, baseDirPath: string, mapping: DMMF.ModelMapping, model: DMMF.Model, dmmfDocument: DmmfDocument, generatorOptions: GeneratorOptions): void;
