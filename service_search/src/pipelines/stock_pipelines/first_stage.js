module.exports = (myMatch, system, filter) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$project": {
                "_id": "$_id",
                "opco": "$opco",
                "artNr": "$artNr",
                "description": "$description",
                "qty": {
                    "$cond": [ 
                        { "$eq": [system, "IMPERIAL"] },
                        {
                            "$switch": {
                                "branches": [
                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$qty", 2.204623 ] } },
                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$qty", 3.28084 ] } }
                                ],
                                default: "$qty"
                            }
                        },
                        "$qty"
                    ]
                },
                "uom": {
                    "$cond": [
                        { "$eq": [system, "IMPERIAL" ] },
                        {
                            "$switch": {
                                "branches": [
                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": "LB" },
                                    { "case": { "$eq": [ "$uom", "LB" ] }, "then": "LB" },
                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": "FT" },
                                    { "case": { "$eq": [ "$uom", "FT" ] }, "then": "FT" },
                                ],
                                default: "ST"
                            }
                        },
                        "$uom"
                    ],
                },
                "firstInStock": {
                    "$cond": [
                        { "$eq": [system, "IMPERIAL" ] },
                        {
                            "$switch": {
                                "branches": [
                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$purchase.firstInStock", 2.204623 ] } },
                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$purchase.firstInStock", 3.28084 ] } }
                                ],
                                "default": "$purchase.firstInStock"
                            }
                        },
                        "$purchase.firstInStock"
                    ],
                },
                "weight": {
                    "$cond": [
                        { "$eq": [system, "IMPERIAL" ] },
                        {
                            "$switch": {
                                "branches": [
                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$weight", 2.204623 ] } },
                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$weight", 0.671969 ] } }
                                ],
                                "default": "$weight"
                            }
                        },
                        "$weight"
                    ],
                },
                "gip": {
                    "$cond": [
                        { "$eq": [ system, "IMPERIAL" ] },
                        {
                            "$switch": {
                                "branches": [
                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$price.gip", 2.204623 ] } },
                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$price.gip", 3.28084 ] } }
                                ],
                                default: "$price.gip"
                            }
                        },
                        "$price.gip"
                    ],
                },
                "currency": "EUR",
                "rv": {
                    "$cond": [
                        { "$eq": [ system, "IMPERIAL" ] },
                        {
                            "$switch": {
                                "branches": [
                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$price.rv", 2.204623 ] } },
                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$price.rv", 3.28084 ] } }
                                ],
                                default: "$price.rv"
                            }
                        },
                        "$price.rv"
                    ],
                },
            }
        },
        {
            "$addFields": {
                "qtyX": { "$toString": "$qty" },
                "firstInStockX": { "$toString": "$firstInStock" },
                "weightX": { "$toString": "$weight" },
                "gipX": { "$toString": "$gip" },
                "rvX": { "$toString": "$rv" },
            }
        },
        {
            "$match": matchFilter(filter.opco, filter.artNr, filter.description, filter.qty, filter.uom, filter.firstInStock, filter.weight, filter.gip, filter.currency, filter.rv)
        },
        {
            "$project": {
                "qtyX": 0,
                "firstInStockX": 0,
                "weightX": 0,
                "gipX": 0,
                "rvX": 0,
                "currency": 0,
            }
        },
    ]
}

function matchFilter() {
    let myArgs = arguments;
    return(["opco", "artNr", "description", "qty", "uom", "firstInStock", "weight", "gip", "currency", "rv"].reduce(function(acc, cur, index) {
        if (!!myArgs[index]) {
            if(["qty", "firstInStock", "weight", "gip", "rv"].includes(cur)) {
                acc[`${cur}X`] = { "$regex": new RegExp(require("../../functions/escape")(myArgs[index]),"i") };
            } else {
                acc[`${cur}`] = { "$regex": new RegExp(require("../../functions/escape")(myArgs[index]),"i") };
            }
        }
        return acc;
    }, {}));
}