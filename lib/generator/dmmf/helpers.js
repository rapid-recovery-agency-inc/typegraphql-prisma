"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributeArgsRegex = exports.attributeNameRegex = exports.fieldAttributeRegex = exports.modelAttributeRegex = void 0;
exports.parseDocumentationAttributes = parseDocumentationAttributes;
exports.modelAttributeRegex = /(@@TypeGraphQL\.)+([A-z])+(\()+(.+)+(\))+/g;
exports.fieldAttributeRegex = /(@TypeGraphQL\.)+([A-z])+(\()+(.+)+(\))+/g;
exports.attributeNameRegex = /(?:\.)+([A-Za-z])+(?:\()+/;
exports.attributeArgsRegex = /(?:\()+([A-Za-z])+\:+(.+)+(?:\))+/;
function parseDocumentationAttributes(documentation, expectedAttributeName, expectedAttributeKind) {
    const attributeRegex = expectedAttributeKind === "model"
        ? exports.modelAttributeRegex
        : exports.fieldAttributeRegex;
    const matchResults = documentation?.matchAll(attributeRegex) ?? [];
    for (const [attribute] of matchResults) {
        const attributeName = attribute
            ?.match(exports.attributeNameRegex)?.[0]
            ?.slice(1, -1);
        if (attributeName !== expectedAttributeName) {
            continue;
        }
        const rawAttributeArgs = attribute
            ?.match(exports.attributeArgsRegex)?.[0]
            ?.slice(1, -1);
        const parsedAttributeArgs = {};
        if (rawAttributeArgs) {
            const rawAttributeArgsParts = rawAttributeArgs
                .split(":")
                .map(it => it.trim())
                .map(part => (part.startsWith("[") ? part : part.split(",")))
                .flat()
                .map(it => it.trim());
            for (let i = 0; i < rawAttributeArgsParts.length; i += 2) {
                const key = rawAttributeArgsParts[i];
                const value = rawAttributeArgsParts[i + 1];
                parsedAttributeArgs[key] = JSON.parse(value);
            }
        }
        return parsedAttributeArgs;
    }
    return {};
}
//# sourceMappingURL=helpers.js.map