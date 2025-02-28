import { promises as fs } from 'fs';

async function jobArrived(s: Switch, flowElement: FlowElement, job: Job) {
    //get variables from script element
    let datasetName: string = await flowElement.getPropertyStringValue("datasetName") as string;
    let keyAndJSONpaths: string | string[] = await flowElement.getPropertyStringValue("keyAndJSONpaths") as string[];

    //get data
    let filePath = await job.getDataset(datasetName, AccessLevel.ReadWrite);
    let data = await fs.readFile(filePath, 'utf8');
    let jsonData = JSON.parse(data);
    await job.log(LogLevel.Info, jsonData);

    //get the data from the path or keyAndJSONpaths
    let keyAndJSONpath: string | undefined;

    if (typeof keyAndJSONpaths === 'string') {
        await job.log(LogLevel.Warning, `Path is a single string ${keyAndJSONpaths}`);
        keyAndJSONpaths[0] = keyAndJSONpaths;
    }
    else if (Array.isArray(keyAndJSONpaths) && keyAndJSONpaths.every(path => typeof path === 'string')) {
        await job.log(LogLevel.Warning, `Path is an array ${keyAndJSONpaths}`);
    }
    else {
        await job.log(LogLevel.Error, `${keyAndJSONpaths} is neither a string nor an array of strings. It cannot be processed`);
        keyAndJSONpaths = '';
    }

    //get the data
    function getValueByPath(jsonData: Record<string, any>, keyAndJSONpath: string): any {
        return keyAndJSONpath
            .replace(/\[(\d+)\]/g, '.$1') // Convert "[0]" into ".0"
            .split('.')                    // Now split normally
            .reduce((acc, key) => acc?.[key], jsonData);
    }

    //loop through keyAndJSONpaths logging each returned value
    for (const keyAndJSONpath of keyAndJSONpaths) {
        const [pdkey, JSONpath] = keyAndJSONpath.split("::");
        const value = getValueByPath(jsonData, JSONpath);
        await job.setPrivateData(pdkey, value);
        await job.log(LogLevel.Warning, 
            `Path "${JSONpath}" produced extracted value: ${value} which will be set to private data key ${pdkey}`
        );
    }

    // //loop through keyAndJSONpaths logging each returned value
    // for (const path of keyAndJSONpaths) {
    //     const value = getValueByPath(jsonData, path);
    //     await job.log(LogLevel.Warning, `Path "${path}" produced extracted value: ${value}`);
    // }

    await job.sendToSingle();
}
