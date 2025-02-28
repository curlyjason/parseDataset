"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValueByPath = void 0;
//getValueByPath
function getValueByPath(jsonData, keyAndJSONpath) {
    let result = keyAndJSONpath
        .replace(/\[(\d+)\]/g, '.$1') // Convert "[0]" into ".0"
        .split('.') // Now split normally
        .reduce((acc, key) => acc === null || acc === void 0 ? void 0 : acc[key], jsonData);
    return result;
}
exports.getValueByPath = getValueByPath;
//# sourceMappingURL=jsonUtils.js.map