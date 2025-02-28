"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const jsonUtils_1 = require("./jsonUtils");
async function jobArrived(s, flowElement, job) {
    //get variables from script element
    let datasetName = await flowElement.getPropertyStringValue("datasetName");
    let delimeter = await flowElement.getPropertyStringValue("delimeter");
    let keyAndJSONpaths = await flowElement.getPropertyStringValue("keyAndJSONpaths");
    //get data
    let filePath = await job.getDataset(datasetName, AccessLevel.ReadWrite);
    let data = await fs_1.promises.readFile(filePath, 'utf8');
    let jsonData = JSON.parse(data);
    await job.log(LogLevel.Info, jsonData);
    // //define the data getter function
    // function getValueByPath(jsonData: Record<string, any>, keyAndJSONpath: string): any {
    //     let result = keyAndJSONpath
    //         .replace(/\[(\d+)\]/g, '.$1') // Convert "[0]" into ".0"
    //         .split('.')                    // Now split normally
    //         .reduce((acc, key) => acc?.[key], jsonData);
    //     return result;
    // }
    //loop through keyAndJSONpaths logging each returned value and creating private data keys
    for (let keyAndJSONpath of keyAndJSONpaths) {
        let [pdkey, JSONpath] = keyAndJSONpath.split(delimeter);
        let value = (0, jsonUtils_1.getValueByPath)(jsonData, JSONpath);
        await job.setPrivateData(pdkey, value);
        await job.log(LogLevel.Warning, `Path "${JSONpath}" produced extracted value: ${value} which will be set to private data key ${pdkey}`);
    }
    await job.sendToSingle();
}
//# sourceMappingURL=main.js.map