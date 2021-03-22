const Param = require("../models/Param");
const projectionResult = require("../projections/projection_result");

const getAll = (req, res, next) => {
    
    // const { filter, sort, dropdown } = req.body;
    
    const nextPage = Number(req.body.nextPage) || 1;
    const pageSize = Number(req.body.pageSize) || 2;

    Param.aggregate([
            {
                $facet: {
                    "data": [
                        { "$match": { "parameters.type.tags": "PIPE SMLS", } },
                        { "$skip": ((nextPage - 1) * pageSize) },
                        { "$limit": pageSize }
                    ],
                    "pagination": [
                        { "$match": { "parameters.type.tags": "PIPE SMLS", } },
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
            res.status(200).json([])
        } else {
            res.status(200).json(result)
        } 
    });
}

// const getAll = (req, res, next) => {
//     const page = Number(decodeURI(req.query.page)) || 1;
//     const limit = Number(decodeURI(req.query.limit)) || 1;
//     const system = decodeURI(req.query.system) || "METRIC";
//     const artNr = decodeURI(req.query.artNr);
//     const opco = decodeURI(req.query.opco);
//     const sizeOne = decodeURI(req.query.sizeOne);
//     const sizeTwo = decodeURI(req.query.sizeTwo);
//     const wallOne = decodeURI(req.query.wallOne);
//     const wallTwo = decodeURI(req.query.wallTwo);
//     const type = decodeURI(req.query.type);
//     const grade = decodeURI(req.query.grade);
//     const length = decodeURI(req.query.length);
//     const end = decodeURI(req.query.end);
//     const surface = decodeURI(req.query.surface);

//     getMatch(artNr, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface).then(myMatch => {
//         Param.aggregate([
//             { $match: myMatch },
//             { $lookup: { from: "stocks", localField: "artNr", foreignField: "artNr", as: "stocks" } },
//             { $unwind: "$stocks" },
//             { $match: { "stocks.opco": !!opco ? opco : { $exists: true } } },
//             { $sort: { "price.gip": 1 } },
//             { $skip : limit * (page - 1) },
//             { $limit : limit },
//             { $project: project(system) }
//         ]).exec(function(error, result) {
//             if (!!error || !result) {
//                 res.status(200).json([])
//             } else {
//                 res.status(200).json(result)
//             }
//         });
//     });
// }


function getMatch(artNr, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface) {
    return new Promise(function(resolve) {
        if (!!artNr) {
            resolve({ "artNr": artNr });
        } else {
            let regexOutlet = /^(ELBOL|ELBOWFL|LATROFL|LATROL|NIPOFL|NIPOL|SOCKOL|SWEEPOL|THREADOL|WELDOL)( \d*)?$/
            if (regexOutlet.test(type)) {
                require("../functions/getSizeMm")(sizeTwo).then(mm => {
                    resolve({
                        "parameters.type.tags": type,
                        "parameters.grade.tags": grade,
                        "parameters.sizeOne.tags": sizeOne,
                        "parameters.sizeTwo.mm": mm !== null ? { $lte: mm } : { $exists: true },
                        "parameters.sizeThree.mm": mm !== null ? { $gte: mm } : { $exists: true },
                        "parameters.wallOne.tags": wallOne ? wallOne : { $exists: true },
                        "parameters.wallTwo.tags": !!wallTwo ? wallTwo : { $exists: true },
                        "parameters.length.tags": !!length ? length : { $exists: true },
                        "parameters.end.tags": !!end ? end : { $exists: true },
                        "parameters.surface.tags": !!surface ? surface : { $exists: true },
                    });
                });
            } else {
                resolve({
                    "parameters.type.tags": type,
                    "parameters.grade.tags": grade,
                    "parameters.sizeOne.tags": sizeOne,
                    "parameters.sizeTwo.tags": !!sizeTwo ? sizeTwo : { $exists: true },
                    "parameters.wallOne.tags": !!wallOne ? wallOne : { $exists: true },
                    "parameters.wallTwo.tags": !!wallTwo ? wallTwo : { $exists: true },
                    "parameters.length.tags": !!length ? length : { $exists: true },
                    "parameters.end.tags": !!end ? end : { $exists: true },
                    "parameters.surface.tags": !!surface ? surface : { $exists: true },
                });
            }
        }
    });
}

function project(system) {
    return {
        _id: 0,
        opco: "$stocks.opco",
        artNr: "$artNr",
        description: "$description",
        qty: {
            $cond: [ 
                { $eq: [system, "IMPERIAL"] },
                {
                    $switch: {
                        branches: [
                            { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.qty", 2.204623 ] } },
                            { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.qty", 3.28084 ] } }
                        ],
                        default: "$stocks.qty"
                    }
                },
                "$stocks.qty"
            ]
        },
        uom: {
            $cond: [
                { $eq: [system, "IMPERIAL" ] },
                {
                    $switch: {
                        branches: [
                            { case: { $eq: [ "$uom", "KG" ] }, then: "LB" },
                            { case: { $eq: [ "$uom", "LB" ] }, then: "LB" },
                            { case: { $eq: [ "$uom", "M" ] }, then: "FT" },
                            { case: { $eq: [ "$uom", "FT" ] }, then: "FT" },
                        ],
                        default: "ST"
                    }
                },
                "$uom"
            ],
        },
        weight: {
            $cond: [
                { $eq: [system, "IMPERIAL" ] },
                {
                    $switch: {
                        branches: [
                            { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$weight", 2.204623 ] } },
                            { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$weight", 0.671969 ] } }
                        ],
                        default: "$weight"
                    }
                },
                "$weight"
            ],
        },
        price: {
            gip: {
                $cond: [
                    { $eq: [ system, "IMPERIAL" ] },
                    {
                        $switch: {
                            branches: [
                                { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.price.gip", 2.204623 ] } },
                                { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.price.gip", 3.28084 ] } }
                            ],
                            default: "$stocks.price.gip"
                        }
                    },
                    "$stocks.price.gip"
                ],
            },
            rv: {
                $cond: [
                    { $eq: [ system, "IMPERIAL" ] },
                    {
                        $switch: {
                            branches: [
                                { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.price.rv", 2.204623 ] } },
                                { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.price.rv", 3.28084 ] } }
                            ],
                            default: "$stocks.price.rv"
                        }
                    },
                    "$stocks.price.rv"
                ],
            },
            currency: "EUR"
        },
        purchase: {
            supplier: "$stocks.purchase.supplier",
            qty: {
                $cond: [
                    { $eq: [system, "IMPERIAL" ] },
                    {
                        $switch: {
                            branches: [
                                { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.purchase.qty", 2.204623 ] } },
                                { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.purchase.qty", 3.28084 ] } }
                            ],
                            default: "$stocks.purchase.qty"
                        }
                    },
                    "$stocks.purchase.qty"
                ],
            },
            firstInStock: {
                $cond: [
                    { $eq: [system, "IMPERIAL" ] },
                    {
                        $switch: {
                            branches: [
                                { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ "$stocks.purchase.firstInStock", 2.204623 ] } },
                                { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ "$stocks.purchase.firstInStock", 3.28084 ] } }
                            ],
                            default: "$stocks.purchase.firstInStock"
                        }
                    },
                    "$stocks.purchase.firstInStock"
                ],
            },
            deliveryDate: "$stocks.purchase.deliveryDate"
        },
        supplier: {
            "names": "$stocks.supplier.names",
            "qtys": [
                {
                    $cond: [
                        { $eq: [system, "IMPERIAL" ] },
                        {
                            $switch: {
                                branches: [
                                    { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 0] }, 2.204623 ] } },
                                    { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 0] }, 3.28084 ] } }
                                ],
                                default: { $arrayElemAt: ["$stocks.supplier.qtys", 0] },
                            }
                        },
                        { $arrayElemAt: ["$stocks.supplier.qtys", 0] },
                    ]
                },
                {
                    $cond: [
                        { $eq: [system, "IMPERIAL" ] },
                        {
                            $switch: {
                                branches: [
                                    { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 1] }, 2.204623 ] } },
                                    { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 1] }, 3.28084 ] } }
                                ],
                                default: { $arrayElemAt: ["$stocks.supplier.qtys", 1] },
                            }
                        },
                        { $arrayElemAt: ["$stocks.supplier.qtys", 1] },
                    ]
                },
                {
                    $cond: [
                        { $eq: [system, "IMPERIAL" ] },
                        {
                            $switch: {
                                branches: [
                                    { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 2] }, 2.204623 ] } },
                                    { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 2] }, 3.28084 ] } }
                                ],
                                default: { $arrayElemAt: ["$stocks.supplier.qtys", 2] },
                            }
                        },
                        { $arrayElemAt: ["$stocks.supplier.qtys", 2] },
                    ]
                },
                {
                    $cond: [
                        { $eq: [system, "IMPERIAL" ] },
                        {
                            $switch: {
                                branches: [
                                    { case: { $eq: [ "$uom", "KG" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 3] }, 2.204623 ] } },
                                    { case: { $eq: [ "$uom", "M" ] }, then: { $multiply: [ { $arrayElemAt: ["$stocks.supplier.qtys", 3] }, 3.28084 ] } }
                                ],
                                default: { $arrayElemAt: ["$stocks.supplier.qtys", 3] },
                            }
                        },
                        { $arrayElemAt: ["$stocks.supplier.qtys", 3] },
                    ]
                }
            ]
        }
    }
}

const stockController = {
    getAll
};

module.exports = stockController;