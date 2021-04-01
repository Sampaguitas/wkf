const Export = require("../models/Export");

module.exports = () => {
    return new Promise(function(resolve, reject) {
        let filter = { "status": "pending" };
        let update = { "status": "started" };
        let options = { "new": true };
        Export.findOneAndUpdate(filter, update, options, function (err, document) {
            if (!!err || !document) {
                reject();
            } else {
                resolve(document);
            }
        });
    });
}