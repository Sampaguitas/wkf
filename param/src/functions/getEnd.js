module.exports = (type, end, pffType) => {
    return new Promise(function (resolve) {
        if (pffType === "PIPE_FITTINGS") {
            resolve({
                "key": "end",
                "value": {
                    "lunar": "01",
                    "name": "BW",
                    "tags": ["BW"]
                }
            });
        } else {
            switch(type) {
                case "WELDOL":
                    resolve({
                        "key": "end",
                        "value": {
                            "lunar": "01",
                            "name": "BW",
                            "tags": ["BW"]
                        }
                    });
                case "SOCKOL 3000":
                case "SOCKOL 6000":
                    resolve({
                        "key": "end",
                        "value": {
                            "lunar": "11",
                            "name": "SW",
                            "tags": ["SW"]
                        }
                    });
                case "THREADOL 3000":
                case "THREADOL 6000":
                    resolve({
                        "key": "end",
                        "value": {
                            "lunar": "17",
                            "name": "NPT",
                            "tags": ["NPT"]
                        }
                    });
                default:
                    resolve(findEnd(end));
            }
        }
    });
}

function findEnd(end) {
    return new Promise(function(resolve) {
        require("../models/End").findOne({name: end}, function (err, res) {
            if (!!err || !res) {
                resolve({
                    "key": "end",
                    "value": {
                        "lunar": "FF", 
                        "name": end,
                        "tags": end ? [end] : []
                    }
                });
            } else {
                resolve({
                    "key": "end",
                    "value": {
                        "lunar": res.lunar,
                        "name": end,
                        "tags": res.tags
                    }
                });
            }
        });
    });
}