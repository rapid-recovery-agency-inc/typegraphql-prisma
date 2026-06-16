"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStringBoolean = parseStringBoolean;
exports.parseString = parseString;
exports.parseStringArray = parseStringArray;
exports.parseStringEnum = parseStringEnum;
function parseStringBoolean(stringBoolean) {
    return stringBoolean === "true"
        ? true
        : stringBoolean === "false"
            ? false
            : undefined;
}
function parseString(value, optionPropertyName) {
    if (Array.isArray(value)) {
        throw new Error(`Invalid "${optionPropertyName}" option value "${value}" provided for TypeGraphQL generator.`);
    }
    return value;
}
function parseStringArray(stringArray, optionPropertyName, allowedValues) {
    if (!stringArray) {
        return undefined;
    }
    let parsedArray;
    if (typeof stringArray === "string") {
        if (!stringArray.includes(",")) {
            throw new Error(`Invalid "${optionPropertyName}" value "${stringArray}" provided for TypeGraphQL generator.`);
        }
        parsedArray = stringArray.split(",").map(it => it.trim());
    }
    else {
        parsedArray = stringArray;
    }
    if (allowedValues) {
        for (const option of parsedArray) {
            if (!allowedValues.includes(option)) {
                throw new Error(`Invalid "${optionPropertyName}" option value "${option}" provided for TypeGraphQL generator.`);
            }
        }
    }
    return parsedArray;
}
function parseStringEnum(stringEnum, optionPropertyName, allowedValues) {
    if (!stringEnum) {
        return undefined;
    }
    if (!allowedValues.includes(stringEnum)) {
        throw new Error(`Invalid "${optionPropertyName}" option value "${stringEnum}" provided for TypeGraphQL generator.`);
    }
    return stringEnum;
}
//# sourceMappingURL=helpers.js.map