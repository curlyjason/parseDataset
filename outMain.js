"use strict";

// <stdin>
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
async function jobArrived(s, flowElement, job) {
  let datasetName = await flowElement.getPropertyStringValue("datasetName");
  let keyAndJSONpaths = await flowElement.getPropertyStringValue("paths");
  let filePath = await job.getDataset(datasetName, AccessLevel.ReadWrite);
  let data = await fs_1.promises.readFile(filePath, "utf8");
  let jsonData = JSON.parse(data);
  await job.log(LogLevel.Info, jsonData);
  let keyAndJSONpath;
  if (typeof keyAndJSONpaths === "string") {
    await job.log(LogLevel.Warning, `Path is a single string ${keyAndJSONpaths}`);
    keyAndJSONpaths[0] = keyAndJSONpaths;
  } else if (Array.isArray(keyAndJSONpaths) && keyAndJSONpaths.every((path) => typeof path === "string")) {
    await job.log(LogLevel.Warning, `Path is an array ${keyAndJSONpaths}`);
  } else {
    await job.log(LogLevel.Error, `${keyAndJSONpaths} is neither a string nor an array of strings. It cannot be processed`);
    keyAndJSONpaths = "";
  }
  function getValueByPath(jsonData2, keyAndJSONpath2) {
    return keyAndJSONpath2.replace(/\[(\d+)\]/g, ".$1").split(".").reduce((acc, key) => acc === null || acc === void 0 ? void 0 : acc[key], jsonData2);
  }
  for (const keyAndJSONpath2 of keyAndJSONpaths) {
    const [pdkey, JSONpath] = keyAndJSONpath2.split("::");
    const value = getValueByPath(jsonData, JSONpath);
    await job.setPrivateData(pdkey, value);
    await job.log(LogLevel.Warning, `Path "${JSONpath}" produced extracted value: ${value} which will be set to private data key ${pdkey}`);
  }
  await job.sendToSingle();
}
//# sourceMappingURL=outMain.js.map
