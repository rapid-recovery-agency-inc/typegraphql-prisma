"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLOCKS_DEPENDENCIES_MAP = exports.ALL_EMIT_BLOCK_KINDS = void 0;
exports.getBlocksToEmit = getBlocksToEmit;
exports.ALL_EMIT_BLOCK_KINDS = [
    "enums",
    "models",
    "crudResolvers",
    "relationResolvers",
    "inputs",
    "outputs",
];
exports.BLOCKS_DEPENDENCIES_MAP = {
    enums: [],
    models: ["enums"],
    crudResolvers: ["models", "enums", "outputs", "inputs"],
    relationResolvers: ["models", "enums", "inputs"],
    inputs: ["enums"],
    outputs: ["enums"],
};
function getBlocksToEmit(emitOnly) {
    if (!emitOnly) {
        return exports.ALL_EMIT_BLOCK_KINDS;
    }
    const blocks = new Set();
    for (const block of emitOnly) {
        blocks.add(block);
        const dependencies = exports.BLOCKS_DEPENDENCIES_MAP[block];
        for (const dependency of dependencies) {
            blocks.add(dependency);
        }
    }
    return Array.from(blocks.values());
}
//# sourceMappingURL=emit-block.js.map