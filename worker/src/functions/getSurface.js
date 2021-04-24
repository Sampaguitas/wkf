module.exports = (surface) => {
    return new Promise(function(resolve) {
        require("../models/Surface").findOne({"name": surface}, function(err, res) {
            if(!!err || !res) {
                resolve({
                    "key": "surface",
                    "value": {
                        'lunar': 'FF',
                        'name': surface,
                        'tags': surface ? [surface] : []
                    }
                });
            } else {
                resolve({
                    "key": "surface",
                    "value": {
                        'lunar': res.lunar,
                        'name': surface,
                        'tags': res.tags
                    }
                });
            }
        });
    });
}