module.exports = (type, sizeId, pffType) => {
    return new Promise(function(resolve) {
        if (!sizeId || !["EN_FLANGES", "FORGED_FLANGES"].includes(pffType)) {
            resolve(findType(type));
        } else {
            resolve(searchType(type, sizeId));
        }
    });
}

function searchType(type, sizeId) {
    return new Promise(function(resolve) {
        require("../models/Searchtype").findOne({
            "minSize": { $lte: sizeId },
            "maxSize": { $gte: sizeId },
            "types": type
        }, function(err, res) {
            if (!!err || !res) {
                resolve(findType(type));
            } else {
                resolve({
                    "key": "type",
                    "value": res.value
                });
            }
        });
    });
}

function findType(type) {
    return new Promise(function(resolve) {
        require("../models/Type").findOne({name: type}, function(err, res) {
            if (!!err || !res) {
                resolve({
                    "key": "type",
                    "value": {
                        'lunar': 'FFF',
                        'name': type,
                        'tags': type ? [type] : [],
                        'pffType': 'OTHER'
                    }
                });
            } else {
                resolve({
                    "key": "type",
                    "value": {
                        'lunar': res.lunar,
                        'name': type,
                        'tags': res.tags,
                        'pffType': res.pffType,
                    }
                });
            }
        });
    });
}