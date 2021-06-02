const currencyTable = (req, res, next) => {
    const lang = req.params.lang || "en-US";

    require("../models/Currency")
    .find({},{name: 1, unitPerUsd: 1, usdPerUnit: 1})
    .exec(function (err, rates) {
        if (!!err) {
            res.send("<html lang=${lang}><tbody><table id='table'><tr><th>Currency code</th><th>Currency name</th><th>Units per USD</th><th>USD per Unit</th></tr></table></tbody></html>");
        } else {
            res.send(`<html lang=${lang} xml:lang=${lang}><tbody><table id='table'><tr><th>Currency code</th><th>Currency name</th><th>Units per USD</th><th>USD per Unit</th></tr>${rates.map(rate => "<tr><td>" + rate._id + "</td><td>" + rate.name + "</td><td>" + rate.unitPerUsd.toLocaleString(lang) + "</td><td>" + rate.usdPerUnit.toLocaleString(lang) + "</td></tr>").join("")}</table></tbody></html>`);
        }
    });    
}

const rateController = {
    currencyTable
};

module.exports = rateController;