module.exports = (size) => {
    return new Promise(function(resolve, reject) {
        if (size === "") {
            resolve(null);
        } else {
            require("../models/Size").findOne({"tags": size, "pffTypes": "FORGED_OLETS"}, function(err, res) {
                if (!!err || !res) {
                    reject();
                } else {
                    resolve(res.mm);
                }
            });
        }
    });
}