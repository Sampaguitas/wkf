module.exports = (length) => {
    return new Promise(function(resolve) {
        require("../models/Length").findOne({name: length}, function(err,res) {
            if(!!err || !res) {
                resolve({
                    "lunar": "FFF", 
                    "name": length,
                    "tags": length ? [length] : []
                });
            } else {
                resolve({
                    "lunar": res.lunar,
                    "name": length,
                    "tags": res.tags
                });
            }
        });
    });
}