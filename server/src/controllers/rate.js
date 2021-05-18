const currencyTable = (req, res, next) => {
    require("../models/Currency")
    .find({},{name: 1, unitPerUsd: 1, usdPerUnit: 1})
    .select("name ")
    .exec(function (err, rates) {
        if (!!err) {
            res.send("<html><tbody><table id='table'><tr><th>Currency code</th><th>Currency name</th><th>Units per USD</th><th>USD per Unit</th></tr></table></tbody></html>");
        } else {
            res.send(`<html><tbody><table id='table'><tr><th>Currency code</th><th>Currency name</th><th>Units per USD</th><th>USD per Unit</th></tr>${rates.map(rate => "<tr><td>" + rate._id + "</td><td>" + rate.name + "</td><td>" + rate.unitPerUsd + "</td><td>" + rate.usdPerUnit + "</td></tr>").join("")}</table></tbody></html>`);
        }
    })
    
}

const rateController = {
    currencyTable
};

module.exports = rateController;