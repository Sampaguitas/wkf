module.exports = (size, pffType) => {
    return new Promise(function(resolve) {
        require("../models/Size").findOne({tags: size, pffTypes: pffType}, function (err, res) {
            if (!!err || !res) {
                resolve({
                    "lunar": "FFF", 
                    "name": size,
                    "tags": size ? [size] : [],
                    "mm": ""
                });
            } else {
                resolve ({
                    "lunar": res.lunar,
                    "name": size,
                    "tags": res.tags,
                    "mm": res.mm
                });
            }
        });
    });
}