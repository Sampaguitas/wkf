module.exports = (sizeId, wall) => {
    return new Promise(function(resolve) {
        require("../models/Wall").findOne({ sizeId, tags: wall }, function(err, res) {
            if (!!err || !res) {
                resolve({
                    "lunar": "FFF",
                    "name": wall,
                    "tags": wall ? [wall] : [],
                    "mm": ""
                });
            } else {
                resolve({
                    "lunar": res.lunar,
                    "name": wall,
                    "tags": res.tags,
                    "mm": res.mm
                });
            }
        });
    });
}