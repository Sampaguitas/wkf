const Stock = require("../models/Stock");
const projectionResult = require("../projections/projection_result");

const getStocks = (req, res, next) => {
    
    const { filter, sort, dropdown } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;
    const system = req.body.system || "METRIC";
    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    // let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    // const {opco, artNr, description, qty, uom, firstInStock, weight, gip, currency, rv} = filter;
    // const { opco, artNr, pffType, steelType, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface } = dropdown;
    
    matchDropdown(dropdown.opco, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface).then(myMatch => {
        Stock.aggregate([
            { "$match": myMatch },
            { "$project": project(system) },
            {
                "$addFields": {
                    "qtyX": { "$toString": "$qty" },
                    "firstInStockX": { "$toString": "$firstInStock" },
                    "weightX": { "$toString": "$weight" },
                    "gipX": { "$toString": "$gip" },
                    "rvX": { "$toString": "$rv" },
                }
            },
            { "$match": matchFilter(filter.opco, filter.artNr, filter.description, filter.qty, filter.uom, filter.firstInStock, filter.weight, filter.gip, filter.currency, filter.rv) },
            { "$sort": { [!!sort.name ? sort.name : "gip"]: sort.isAscending === false ? -1 : 1 } },
            {
                "$project": {
                    "_id": 0,
                    "qtyX": 0,
                    "firstInStockX": 0,
                    "weightX": 0,
                    "gipX": 0,
                    "rvX": 0,
                    "currency": 0,
                    "parameters": 0
                }
            }
        ]).exec(function(error, result) {
            if (!!error || !result) {
                console.log(error)
                res.status(200).json([]);
            } else {
                res.status(200).json(result);
            }
        });
    });
    
}

const getParams = (req, res, next) => {
    
    const { filter, sort, dropdown } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;
    const system = req.body.system || "METRIC";
    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    // let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    // const {opco, artNr, description, qty, uom, firstInStock, weight, gip, currency, rv} = filter;
    // const { opco, artNr, pffType, steelType, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface } = dropdown;
    
    matchDropdown(dropdown.opco, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface).then(myMatch => {
        Stock.aggregate([
            { "$match": myMatch },
            { "$project": project(system) },
            {
                "$addFields": {
                    "qtyX": { "$toString": "$qty" },
                    "firstInStockX": { "$toString": "$firstInStock" },
                    "weightX": { "$toString": "$weight" },
                    "gipX": { "$toString": "$gip" },
                    "rvX": { "$toString": "$rv" },
                }
            },
            { "$match": matchFilter(filter.opco, filter.artNr, filter.description, filter.qty, filter.uom, filter.firstInStock, filter.weight, filter.gip, filter.currency, filter.rv) },
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
        ]).exec(function(error, result) {
            if (!!error || !result) {
                console.log(error)
                res.status(200).json([]);
            } else {
                res.status(200).json(result);
            }
        });
    });
    
}

function matchFilter() {
    let myArgs = arguments;
    return(["opco", "artNr", "description", "qty", "uom", "firstInStock", "weight", "gip", "currency", "rv"].reduce(function(acc, cur, index) {
        if (!!myArgs[index]) {
            if(["qty", "firstInStock", "weight", "gip", "rv"].includes(cur)) {
                acc[`${cur}X`] = { "$regex": new RegExp(require("../functions/escape")(myArgs[index]),"i") };
            } else {
                acc[`${cur}`] = { "$regex": new RegExp(require("../functions/escape")(myArgs[index]),"i") };
            }
        }
        return acc;
    }, {}));
}


function matchDropdown() {
    let myArgs = arguments;
    return new Promise(function(resolve) {
            let regexOutlet = /^(ELBOL|ELBOWFL|LATROFL|LATROL|NIPOFL|NIPOL|SOCKOL|SWEEPOL|THREADOL|WELDOL)( \d*)?$/
            if (regexOutlet.test(myArgs[7])) {
                require("../functions/getSizeMm")(myArgs[4]).then(mm => {
                    resolve(["opco", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface"].reduce(function(acc, cur, index) {
                        if (!!myArgs[index]) {
                            if (cur === "opco") {
                                acc[`${cur}`] = myArgs[index];
                            } else if (cur === "pffType") {
                                acc[`parameters.type.pffType`] = myArgs[index];
                            } else if (cur === "steelType") {
                                acc[`parameters.grade.steelType`] = myArgs[index];
                            } else if (cur === "sizeTwo" && mm !== null) {
                                acc[`parameters.sizeTwo.mm`] = { $lte: mm };
                                acc[`parameters.sizeThree.mm`] = { $gte: mm };
                            } else {
                                acc[`parameters.${cur}.tags`] = myArgs[index];
                            }
                        }
                        return acc;
                    },{}));
                });
            } else {
                resolve(["opco", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface"].reduce(function(acc, cur, index) {
                    if (!!myArgs[index]) {
                        if (cur === "opco") {
                            acc[`${cur}`] = myArgs[index];
                        } else if (cur === "pffType") {
                            acc[`parameters.type.pffType`] = myArgs[index];
                        } else if (cur === "steelType") {
                            acc[`parameters.grade.steelType`] = myArgs[index];
                        } else {
                            acc[`parameters.${cur}.tags`] = myArgs[index];
                        }
                    }
                    return acc;
                },{}));
            }
    });
}

function project(system) {
    return {
        "_id": "$_id",
        "opco": "$opco",
        "vlunar": "$vlunar",
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
        "purchaseQty": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$purchase.qty", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$purchase.qty", 3.28084 ] } }
                        ],
                        "default": "$purchase.qty"
                    }
                },
                "$purchase.qty"
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
        "supplier": "$purchase.supplier",
        "purchaseDeliveryDate": "$purchase.deliveryDate",
        "nameSupplierOne": {"$ifNull": [{ "$arrayElemAt": ["$supplier.names", 0]}, ""]},
        "nameSupplierTwo": {"$ifNull": [{ "$arrayElemAt": ["$supplier.names", 1]}, ""]},
        "nameSupplierThree": {"$ifNull": [{ "$arrayElemAt": ["$supplier.names", 2]}, ""]},
        "nameSupplierFour": {"$ifNull": [{ "$arrayElemAt": ["$supplier.names", 3]}, ""]},
        "qtySupplierOne": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 0]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 0]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 0]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 0]}
            ],
        },
        "qtySupplierTwo": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 1]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 1]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 1]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 1]}
            ],
        },
        "qtySupplierThree": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 2]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 2]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 2]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 2]}
            ],
        },
        "qtySupplierFour": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 3]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 3]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 3]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 3]}
            ],
        },
        "parameters": {
            "steelType": { "$ifNull": [ "$parameters.grade.steelType", "" ] },
            "pffType": { "$ifNull": [ "$parameters.type.pffType", "" ] },
            "sizeOne": { "$ifNull": [ "$parameters.sizeOne.name", "" ] },
            "sizeTwo": { "$ifNull": [ "$parameters.sizeTwo.name", "" ] },
            "sizeThree": { "$ifNull": [ "$parameters.sizeThree.name", "" ] },
            "wallOne": { "$ifNull": [ "$parameters.wallOne.name", "" ] },
            "wallTwo": { "$ifNull": [ "$parameters.wallTwo.name", "" ] },
            "type": { "$ifNull": [ "$parameters.type.name", "" ] },
            "grade": { "$ifNull": [ "$parameters.grade.name", "" ] },
            "length": { "$ifNull": [ "$parameters.length.name", "" ] },
            "end": { "$ifNull": [ "$parameters.end.name", "" ] },
            "surface": { "$ifNull": [ "$parameters.surface.name", "" ] },
        }
    }
}

const stockController = {
    getParams,
    getStocks
};

module.exports = stockController;