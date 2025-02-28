"use strict";

// <stdin>
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
async function jobArrived(s, flowElement, job) {
  let datasetName = await flowElement.getPropertyStringValue("datasetName");
  let keyAndJSONpaths = await flowElement.getPropertyStringValue("keyAndJSONpaths");
  let filePath = await job.getDataset(datasetName, AccessLevel.ReadWrite);
  let data = await fs_1.promises.readFile(filePath, "utf8");
  let jsonData = JSON.parse(data);
  await job.log(LogLevel.Info, jsonData);
  function getValueByPath(jsonData2, keyAndJSONpath) {
    return keyAndJSONpath.replace(/\[(\d+)\]/g, ".$1").split(".").reduce((acc, key) => acc === null || acc === void 0 ? void 0 : acc[key], jsonData2);
  }
  for (let keyAndJSONpath of keyAndJSONpaths) {
    let [pdkey, JSONpath] = keyAndJSONpath.split("::");
    let value = getValueByPath(jsonData, JSONpath);
    await job.setPrivateData(pdkey, value);
    await job.log(LogLevel.Warning, `Path "${JSONpath}" produced extracted value: ${value} which will be set to private data key ${pdkey}`);
  }
  await job.sendToSingle();
}
//# sourceMappingURL=outMain.js.map
