module.exports = (type) => {
    return new Promise(function(resolve) {
        require("../models/Type").findOne({name: type}, function (err, res) {
            resolve( { "key": "pffType", "value": (!!err || !res) ?  "OTHER" : res.pffType });
        });
    });
}