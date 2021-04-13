const projection = require("./projection");

module.exports = (myMatch, system, filter, sort) => {
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
        {
            "$sort": {
                [!!sort.name ? sort.name : "gip"]: sort.isAscending === false ? -1 : 1,
                "_id": 1
            } 
        },
        {
            "$project": {
                "_id": 0,
                "qtyX": 0,
                "firstInStockX": 0,
                "gipX": 0,
                "rvX": 0,
                "currency": 0,
            }
        },
    ]
}

function matchFilter() {
    let myArgs = arguments;
    return(["opco", "artNr", "description", "qty", "firstInStock", "uom", "gip", "rv", "currency"].reduce(function(acc, cur, index) {
        if (!!myArgs[index]) {
            if(["qty", "firstInStock", "rv", "gip"].includes(cur)) {
                acc[`${cur}X`] = { "$regex": new RegExp(require("../../functions/escape")(myArgs[index]),"i") };
            } else {
                acc[`${cur}`] = { "$regex": new RegExp(require("../../functions/escape")(myArgs[index]),"i") };
            }
        }
        return acc;
    }, {}));
}