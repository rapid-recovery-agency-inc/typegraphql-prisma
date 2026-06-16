"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DMMF = void 0;
var DMMF;
(function (DMMF) {
    let ModelAction;
    (function (ModelAction) {
        ModelAction["findUnique"] = "findUnique";
        ModelAction["findUniqueOrThrow"] = "findUniqueOrThrow";
        ModelAction["findFirst"] = "findFirst";
        ModelAction["findFirstOrThrow"] = "findFirstOrThrow";
        ModelAction["findMany"] = "findMany";
        ModelAction["createOne"] = "createOne";
        ModelAction["createMany"] = "createMany";
        ModelAction["createManyAndReturn"] = "createManyAndReturn";
        ModelAction["updateOne"] = "updateOne";
        ModelAction["updateMany"] = "updateMany";
        ModelAction["upsertOne"] = "upsertOne";
        ModelAction["deleteOne"] = "deleteOne";
        ModelAction["deleteMany"] = "deleteMany";
        ModelAction["groupBy"] = "groupBy";
        // count = "count",
        ModelAction["aggregate"] = "aggregate";
        ModelAction["findRaw"] = "findRaw";
        ModelAction["aggregateRaw"] = "aggregateRaw";
    })(ModelAction = DMMF.ModelAction || (DMMF.ModelAction = {}));
})(DMMF || (exports.DMMF = DMMF = {}));
//# sourceMappingURL=types.js.map