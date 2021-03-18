module.exports = (currency) => {
    return new Promise(function(resolve, reject) {
        if (!currency || currency === "EUR") {
            resolve({
                currency: "EUR",
                rate: 1
            })
        } else {
            require("../models/Currency").findById("EUR", function (errRateFrom, resRateFrom) {
                if (!!errRateFrom || !resRateFrom || !resRateFrom.usdPerUnit) {
                    reject("could not retreive exchange rate.");
                } else {
                    require("../models/Currency").findById(currency, function (errRateTo, resRateTo) {
                        if (!!errRateTo || !resRateTo || !resRateTo.unitPerUsd) {
                            reject("could not retreive exchange rate.");
                        } else {
                            resolve({
                                currency: currency,
                                rate: resRateFrom.usdPerUnit * resRateTo.unitPerUsd
                            });
                        }
                    });
                }
            });
        }
    });
}