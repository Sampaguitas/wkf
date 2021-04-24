module.exports = function getRate(rateFrom, rateTo){
    return new Promise(function(resolve, reject) {
        if (!rateFrom || !rateTo) {
            reject("argument is missing.");
        } else {
            require("../models/Currency").findById(rateFrom, function (errRateFrom, resRateFrom) {
                if (!!errRateFrom || !resRateFrom || !resRateFrom.usdPerUnit) {
                    reject("could not find rate from");
                } else {
                    require("../models/Currency").findById(rateTo, function (errRateTo, resRateTo) {
                        if (!!errRateTo || !resRateTo || !resRateTo.unitPerUsd) {
                            reject("could not find rate to");
                        } else {
                            resolve(require("./roundTo")(resRateFrom.usdPerUnit * resRateTo.unitPerUsd, 6));
                        }
                    });
                }
            });
        }
    });
}