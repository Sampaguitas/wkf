module.exports = (size, pffType, key) => {
    return new Promise(function(resolve) {
        require("../models/Size").findOne({"tags": size, "pffTypes": pffType}, function (err, res) {
            if (!!err || !res) {
                resolve({
                    "key": key,
                    "value": {
                        "lunar": "FFF", 
                        "name": size,
                        "tags": size ? [size] : [],
                        "mm": ""
                    }
                });
            } else {
                resolve ({
                    "key": key,
                    "value": {
                        "lunar": res.lunar,
                        "name": size,
                        "tags": res.tags,
                        "mm": res.mm
                    }
                });
            }
        });
    });
}