const Stock = require("../models/Stock");
const projectionResult = require("../projections/projection_result");

const getAll = (req, res, next) => {
    
    const { filter, sort, dropdown } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;
    const system = req.body.system || "METRIC";
    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    // let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    const {opco, artNr, description, qty, uom, supplier, gip, currency, rv} = filter;
    const { pffType, steelType, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface } = dropdown;
    
    matchDropdown(pffType, steelType, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface).then(myMatch => {
        Stock.aggregate([
            {
                $facet: {
                    "data": [
                        { "$match": myMatch },
                        { "$project": project(system) },
                        {
                            "$addFields": {
                                "qtyX": { "$toString": "$qty" },
                                "gipX": { "$toString": "$gip" },
                                "rvX": { "$toString": "$rv" },
                            }
                        },
                        { "$match": matchFilter(opco, artNr, description, qty, uom, supplier, gip, currency, rv) },
                        { "$project": { "qtyX": 0, "gipX": 0, "rvX": 0, } },
                        { "$sort": { [!!sort.name ? sort.name : "gip"]: sort.isAscending === false ? -1 : 1 } },
                        { "$skip": ((nextPage - 1) * pageSize) },
                        { "$limit": pageSize }
                    ],
                    "pagination": [
                        { "$match": myMatch },
                        { "$project": project(system) },
                        {
                            "$addFields": {
                                "qtyX": { "$toString": "$qty" },
                                "gipX": { "$toString": "$gip" },
                                "rvX": { "$toString": "$rv" },
                            }
                        },
                        { "$match": matchFilter(opco, artNr, description, qty, uom, supplier, gip, currency, rv) },
                        { "$project": { "qtyX": 0, "gipX": 0, "rvX": 0, } },
                        { "$count": "totalItems" },
                        {
                            "$addFields": {
                                "nextPage": nextPage,
                                "pageSize": pageSize
                                
                            }
                        }
                    ]
                }
            },
            {
                $project: projectionResult(nextPage, pageSize)
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

function matchFilter() {
    let myArgs = arguments;
    return(["opco", "artNr", "description", "qty", "uom", "supplier", "gip", "currency", "rv"].reduce(function(acc, cur, index) {
        if (!!myArgs[index]) {
            if(["qty", "gip", "rv"].includes(cur)) {
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
            if (regexOutlet.test(myArgs[6])) {
                require("../functions/getSizeMm")(myArgs[3]).then(mm => {
                    resolve(["pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface"].reduce(function(acc, cur, index) {
                        if (!!myArgs[index]) {
                            if (cur === "pffType") {
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
                resolve(["pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface"].reduce(function(acc, cur, index) {
                    if (!!myArgs[index]) {
                        if (cur === "pffType") {
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
        "supplier": { "$arrayElemAt": ["$supplier.names", 0] },
        // "suppliers": {
        //     "$reduce": {
        //         "input": "$stocks.supplier.names",
        //         "initialValue": "",
        //         "in": {
        //           "$concat": [
        //             "$$value",
        //             {
        //               "$cond": {
        //                 "if": {
        //                     "$or": [
        //                         { "$eq": [ "$$value", "" ] },
        //                         { "$eq": [ "$$this", "" ] },
        //                     ],
        //                 },
        //                 "then": "",
        //                 "else": ", "
        //               }
        //             },
        //             "$$this"
        //           ]
        //         }
        //     }
        // },
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
}

// function project(system) {
//     return {
//         _id: 0,
//         opco: "$stocks.opco",
//         artNr: "$artNr",
//         description: "$description",
//         qty: {
//             $cond: [ 
//                 { $eq: [system, "IMPERIAL"] },
//                 {
//                     $switch: {
//                         branches: [
//                             { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.qty", 2.204623 ] } },
//                             { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.qty", 3.28084 ] } }
//                         ],
//                         default: "$stocks.qty"
//                     }
//                 },
//                 "$stocks.qty"
//             ]
//         },
//         uom: {
//             $cond: [
//                 { $eq: [system, "IMPERIAL" ] },
//                 {
//                     $switch: {
//                         branches: [
//                             { case: { $eq: [ "$uom", "KG" ] }, then: "LB" },
//                             { case: { $eq: [ "$uom", "LB" ] }, then: "LB" },
//                             { case: { $eq: [ "$uom", "M" ] }, then: "FT" },
//                             { case: { $eq: [ "$uom", "FT" ] }, then: "FT" },
//                         ],
//                         default: "ST"
//                     }
//                 },
//                 "$uom"
//             ],
//         },
//         weight: {
//             $cond: [
//                 { $eq: [system, "IMPERIAL" ] },
//                 {
//                     $switch: {
//                         branches: [
//                             { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$weight", 2.204623 ] } },
//                             { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$weight", 0.671969 ] } }
//                         ],
//                         default: "$weight"
//                     }
//                 },
//                 "$weight"
//             ],
//         },
//         price: {
//             gip: {
//                 $cond: [
//                     { $eq: [ system, "IMPERIAL" ] },
//                     {
//                         $switch: {
//                             branches: [
//                                 { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.price.gip", 2.204623 ] } },
//                                 { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.price.gip", 3.28084 ] } }
//                             ],
//                             default: "$stocks.price.gip"
//                         }
//                     },
//                     "$stocks.price.gip"
//                 ],
//             },
//             rv: {
//                 $cond: [
//                     { $eq: [ system, "IMPERIAL" ] },
//                     {
//                         $switch: {
//                             branches: [
//                                 { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.price.rv", 2.204623 ] } },
//                                 { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.price.rv", 3.28084 ] } }
//                             ],
//                             default: "$stocks.price.rv"
//                         }
//                     },
//                     "$stocks.price.rv"
//                 ],
//             },
//             currency: "EUR"
//         },
//         purchase: {
//             supplier: "$stocks.purchase.supplier",
//             qty: {
//                 $cond: [
//                     { $eq: [system, "IMPERIAL" ] },
//                     {
//                         $switch: {
//                             branches: [
//                                 { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.purchase.qty", 2.204623 ] } },
//                                 { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.purchase.qty", 3.28084 ] } }
//                             ],
//                             default: "$stocks.purchase.qty"
//                         }
//                     },
//                     "$stocks.purchase.qty"
//                 ],
//             },
//             firstInStock: {
//                 $cond: [
//                     { $eq: [system, "IMPERIAL" ] },
//                     {
//                         $switch: {
//                             branches: [
//                                 { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.purchase.firstInStock", 2.204623 ] } },
//                                 { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.purchase.firstInStock", 3.28084 ] } }
//                             ],
//                             default: "$stocks.purchase.firstInStock"
//                         }
//                     },
//                     "$stocks.purchase.firstInStock"
//                 ],
//             },
//             deliveryDate: "$stocks.purchase.deliveryDate"
//         },
//         supplier: {
//             "names": "$stocks.supplier.names",
//             "qtys": [
//                 {
//                     $cond: [
//                         { $eq: [system, "IMPERIAL" ] },
//                         {
//                             $switch: {
//                                 branches: [
//                                     { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 0] }, 2.204623 ] } },
//                                     { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 0] }, 3.28084 ] } }
//                                 ],
//                                 default: { $arrayElemAt: ["$stocks.supplier.qtys", 0] },
//                             }
//                         },
//                         { $arrayElemAt: ["$stocks.supplier.qtys", 0] },
//                     ]
//                 },
//                 {
//                     $cond: [
//                         { $eq: [system, "IMPERIAL" ] },
//                         {
//                             $switch: {
//                                 branches: [
//                                     { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 1] }, 2.204623 ] } },
//                                     { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 1] }, 3.28084 ] } }
//                                 ],
//                                 default: { $arrayElemAt: ["$stocks.supplier.qtys", 1] },
//                             }
//                         },
//                         { $arrayElemAt: ["$stocks.supplier.qtys", 1] },
//                     ]
//                 },
//                 {
//                     $cond: [
//                         { $eq: [system, "IMPERIAL" ] },
//                         {
//                             $switch: {
//                                 branches: [
//                                     { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 2] }, 2.204623 ] } },
//                                     { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 2] }, 3.28084 ] } }
//                                 ],
//                                 default: { $arrayElemAt: ["$stocks.supplier.qtys", 2] },
//                             }
//                         },
//                         { $arrayElemAt: ["$stocks.supplier.qtys", 2] },
//                     ]
//                 },
//                 {
//                     $cond: [
//                         { $eq: [system, "IMPERIAL" ] },
//                         {
//                             $switch: {
//                                 branches: [
//                                     { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 3] }, 2.204623 ] } },
//                                     { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 3] }, 3.28084 ] } }
//                                 ],
//                                 default: { $arrayElemAt: ["$stocks.supplier.qtys", 3] },
//                             }
//                         },
//                         { $arrayElemAt: ["$stocks.supplier.qtys", 3] },
//                     ]
//                 }
//             ]
//         }
//     }
// }

const stockController = {
    getAll
};

module.exports = stockController;