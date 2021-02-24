module.exports = (grade) => {
    return new Promise(function(resolve) {
        require("../models/Grade").findOne({name: grade}, function(err, res) {
            if(!!err || !res) {
                resolve({
                    'lunar': 'FFF', 
                    'name': grade,
                    'tags': grade ? [grade] : [],
                    'steelType': 'OTHER',
                });
            } else {
                resolve({
                    'lunar': res.lunar,
                    'name': grade,
                    'tags': res.tags,
                    'steelType': res.steelType,
                });
            }
        });
    });
}