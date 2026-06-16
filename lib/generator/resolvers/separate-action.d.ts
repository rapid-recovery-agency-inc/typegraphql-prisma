import { Project } from "ts-morph";
import { DmmfDocument } from "../dmmf/dmmf-document";
import { DMMF } from "../dmmf/types";
import { GeneratorOptions } from "../options";
export default function generateActionResolverClass(project: Project, baseDirPath: string, model: DMMF.Model, action: DMMF.Action, mapping: DMMF.ModelMapping, dmmfDocument: DmmfDocument, generatorOptions: GeneratorOptions): void;
