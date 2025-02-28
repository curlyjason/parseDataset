import { promises as fs } from 'fs';
import {getValueByPath} from './jsonUtils'

async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
    //get variables from script element
    let datasetName: string = await flowElement.getPropertyStringValue("datasetName") as string;
    let delimeter: string = await flowElement.getPropertyStringValue("delimeter") as string;
    let keyAndJSONpaths: string[] = await flowElement.getPropertyStringValue("keyAndJSONpaths") as string[];

    //get data
    let filePath = await job.getDataset(datasetName, AccessLevel.ReadWrite);
    let data = await fs.readFile(filePath, 'utf8');
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
        let value = getValueByPath(jsonData, JSONpath);
        await job.setPrivateData(pdkey, value);
        await job.log(LogLevel.Warning, 
            `Path "${JSONpath}" produced extracted value: ${value} which will be set to private data key ${pdkey}`
        );
    }

    await job.sendToSingle();
}
