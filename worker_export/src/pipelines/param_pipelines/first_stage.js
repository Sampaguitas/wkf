const projection = require("./projection");

module.exports = (myMatch, system, filter) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$project": projection(system)
        },
        {
            "$addFields": {
                "qtyX": { "$toString": "$qty" },
                "firstInStockX": { "$toString": "$firstInStock" },
                "gipX": { "$toString": "$gip" },
                "rvX": { "$toString": "$rv" },
            }
        },
        {
            "$match": matchFilter(filter.opco, filter.artNr, filter.description, filter.qty, filter.firstInStock, filter.uom, filter.gip, filter.rv, filter.currency)
        },
        { "$sort": { "artNr": 1, "qty": -1 } },
        {
            "$group": {
              "_id": "$artNr",
              "description": { "$first": "$description" },
              "steelType": { "$first": "$parameters.steelType" },
              "pffType": { "$first": "$parameters.pffType" },
              "sizeOne": { "$first": "$parameters.sizeOne" },
              "sizeTwo": { "$first": "$parameters.sizeTwo" },
              "sizeThree": { "$first": "$parameters.sizeThree" },
              "wallOne": { "$first": "$parameters.wallOne" },
              "wallTwo": { "$first": "$parameters.wallTwo" },
              "type": { "$first": "$parameters.type" },
              "grade": { "$first": "$parameters.grade" },
              "length": { "$first": "$parameters.length" },
              "end": { "$first": "$parameters.end" },
              "surface": { "$first": "$parameters.surface" },
            }
        },
    ]
}

function matchFilter() {
    let myArgs = arguments;
    return(["opco", "artNr", "description", "qty", "firstInStock", "uom", "gip", "rv", "currency"].reduce(function(acc, cur, index) {
        if (!!myArgs[index]) {
            if(["qty", "firstInStock", "gip", "rv"].includes(cur)) {
                acc[`${cur}X`] = { "$regex": new RegExp(require("../../functions/escape")(myArgs[index]),"i") };
            } else {
                acc[`${cur}`] = { "$regex": new RegExp(require("../../functions/escape")(myArgs[index]),"i") };
            }
        }
        return acc;
    }, {}));
}