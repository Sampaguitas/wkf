module.exports = (grade) => {
    return new Promise(function(resolve) {
        require("../models/Grade").findOne({name: grade}, function(err, res) {
            if(!!err || !res) {
                resolve({
                    "key": "grade",
                    "value": {
                        "lunar": "FFF", 
                        "name": grade,
                        "tags": grade ? [grade] : [],
                        "steelType": "OTHER"
                    }
                });
            } else {
                resolve({
                    "key": "grade",
                    "value": {
                        "lunar": res.lunar,
                        "name": grade,
                        "tags": res.tags,
                        "steelType": res.steelType
                    }
                });
            }
        });
    });
}