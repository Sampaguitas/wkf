const fetch = require("node-fetch");

module.exports = () => {
    return new Promise(function(resolve) {
        let myPromises = [];
        fetch(`http://api.currencylayer.com/live?access_key=${process.env.CURRENCY_LAYER_KEY}`, requestOptions)
        .then(res => {
            if (res.hasOwnProperty("quotes")) {
                for (let key in res.quotes) {
                    if (key.length === 6) {
                        myPromises.push(upsertRate(key.substring(3,6), res.quotes[key]))
                    }
                }
                Promise.all(upsertRate).then( () => resolve());
            } else {
                resolve()
            }
        }).catch(() => resolve());
    });
}

function upsertRate(_id, val) {
    return new Promise(function(resolve) {
        let update = { unitPerUsd: val, usdPerUnit: (1/val) }
        let options = { new: true, upsert: true }
        require("../models/Currency").findByIdAndUpdate(_id, update, options, () => resolve ());
    });
}