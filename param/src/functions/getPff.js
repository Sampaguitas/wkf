module.exports = (type) => {
    return new Promise(function(resolve) {
        require("../models/Type").findOne({name: type}, function (err, res) {
            resolve( (!!err || !res) ? "OTHER" : res.pffType );
        });
    });
}