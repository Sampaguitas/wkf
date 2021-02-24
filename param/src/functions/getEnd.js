module.exports = (type, end) => {
    return new Promise(function (resolve) {
        if (type.pffType === "PIPE_FITTINGS") {
            resolve({
                "lunar": "01",
                "name": "BW",
                "tags": ["BW"]
            })
        } else if (type.pffType === "FORGED_OLETS") {
            switch(type.name) {
                case "WELDOL":
                    resolve({
                        "lunar": "01",
                        "name": "BW",
                        "tags": ["BW"]
                    });
                case "SOCKOL 3000":
                case "SOCKOL 6000":
                    resolve({
                        "lunar": "11",
                        "name": "SW",
                        "tags": ["SW"]
                    });
                case "THREADOL 3000":
                case "THREADOL 6000":
                    resolve({
                        "lunar": "17",
                        "name": "NPT",
                        "tags": ["NPT"]
                    });
                default:
                    resolve(findEnd(end));
            }
        } else {
            resolve(findEnd(end));
        }
    });
}

function findEnd(end) {
    return new Promise(function(resolve) {
        require("../models/End").findOne({name: end}, function (err, res) {
            if (!!err || !res) {
                resolve({
                    "lunar": "FF", 
                    "name": end,
                    "tags": end ? [end] : []
                })
            } else {
                resolve({
                    "lunar": res.lunar,
                    "name": end,
                    "tags": res.tags
                })
            }
        })
    });
}