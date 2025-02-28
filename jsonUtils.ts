    //getValueByPath
    export function getValueByPath(jsonData: Record<string, any>, keyAndJSONpath: string): any {
        let result = keyAndJSONpath
            .replace(/\[(\d+)\]/g, '.$1') // Convert "[0]" into ".0"
            .split('.')                    // Now split normally
            .reduce((acc, key) => acc?.[key], jsonData);
        return result;
    }

