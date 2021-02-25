module.exports = (length) => {
    return new Promise(function(resolve) {
        if (!length) {
            resolve({
                "key": "length",
                "value": {
                    "lunar": "FFF", 
                    "name": "",
                    "tags": []
                }
            });
        } else {
            require("../models/Length").findOne({"name": length}, function(err,res) {
                if(!!err || !res) {
                    resolve({
                        "key": "length",
                        "value": {
                            "lunar": "FFF", 
                            "name": length,
                            "tags": length ? [length] : []
                        }
                    });
                } else {
                    resolve({
                        "key": "length",
                        "value": {
                            "lunar": res.lunar,
                            "name": length,
                            "tags": res.tags
                        }
                    });
                }
            });
        }
    });
}