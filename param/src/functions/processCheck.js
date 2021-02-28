module.exports = (processType) => {
    return new Promise(function(resolve, reject) {
        require("../models/Process").findOne({
            "process_type": processType,
            "progress": { $ne: 1 },
            "isStalled": false,
        }, function (err, res) {
            if (!!err) {
                reject({"message": "an error has occured."});
            } else if (!!res) {
                reject({"message": "annother process is currently running."});
            } else {
                resolve();
            }
        });
    });
}