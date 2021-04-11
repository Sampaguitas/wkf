const fetch = require("node-fetch");

module.exports = () => {
    return new Promise(function(resolve) {
        let myPromises = [];
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json'},
        }
        fetch(`http://api.currencylayer.com/live?access_key=${process.env.CURRENCY_LAYER_KEY}`, requestOptions)
        .then(res => res.json())
        .then(json => {
            if (json.success && json.hasOwnProperty("quotes")) {
                for (let key in json.quotes) {
                    if (key.length === 6) {
                        myPromises.push(upsertRate(key.substring(3,6), json.quotes[key]))
                    }
                }
                Promise.all(myPromises).then( () => resolve());
            } else {
                resolve()
            }
        }).catch(() => resolve());
    });
}

function upsertRate(_id, val) {
    return new Promise(function(resolve) {
        let update = { unitPerUsd: val, usdPerUnit: roundTo(1/val, 6) }
        let options = { new: true, upsert: true }
        require("../models/Currency").findByIdAndUpdate(_id, update, options, function(err, res) {
            if (err) {
                resolve();
            } else {
                resolve();
            }
        });
    });
}

function roundTo(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}