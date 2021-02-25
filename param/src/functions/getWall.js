module.exports = (wall, sizeId, key) => {
    return new Promise(function(resolve) {
        require("../models/Wall").findOne({ sizeId, tags: wall }, function(err, res) {
            if (!!err || !res) {
                resolve({
                    "key": key,
                    "value": {
                        "lunar": "FFF",
                        "name": wall,
                        "tags": wall ? [wall] : [],
                        "mm": ""
                    }
                });
            } else {
                resolve({
                    "key": key,
                    "value": {
                        "lunar": res.lunar,
                        "name": wall,
                        "tags": res.tags,
                        "mm": res.mm
                    }
                });
            }
        });
    });
}