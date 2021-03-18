import _ from "lodash";

export default function copyObject(mainObj) {
    if (!!mainObj && !_.isEmpty(mainObj)) {
        let objCopy = {};
        let key;
    
        for (key in mainObj) {
            objCopy[key] = mainObj[key];
        }
        return objCopy;
    } else {
        return {};
    }
}