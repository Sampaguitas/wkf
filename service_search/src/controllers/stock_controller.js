const Stock = require("../models/Stock");
const projectionResult = require("../pipelines/projections/projection_result");
const firstStage = require("../pipelines/stock_pipelines/first_stage");

const getById = (req, res, next) => {

    const {articleId} = req.params;

    Stock.findById(articleId, function (err, article) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!article) {
            res.status(400).json({ message: "Could not retrieve article information." });
        } else {
            // res.json({article: article});
            res.json({article: {
                "opco": article.opco,
                "artNr": article.artNr,
                "description": article.description,
                "vlunar": article.vlunar,
                "weight": article.weight,
                "uom": article.uom,
                "qty": article.qty,
                "price": {
                    "gip": article.price.gip,
                    "rv": article.price.rv,
                },
                "purchase": {
                    "supplier": article.purchase.supplier,
                    "qty": article.purchase.qty,
                    "firstInStock": article.purchase.firstInStock,
                    "deliveryDate": article.purchase.deliveryDate
                },
                "supplier": {
                    "names": article.supplier.names,
                    "qtys": article.supplier.qtys
                },
                "parameters": !article.parameters ? 
                (
                    {
                        "sizeOne": { "name": "", "tags": [] },
                        "sizeTwo": { "name": "", "tags": [] },
                        "sizeThree": { "name": "", "tags": [] },
                        "wallOne": { "name": "", "tags": [] },
                        "wallTwo": { "name": "", "tags": [] },
                        "type": { "name": "", "tags": [] },
                        "grade": { "name": "", "tags": [] },
                        "length": { "name": "", "tags": [] },
                        "end": { "name": "", "tags": [] },
                        "surface": { "name": "", "tags": [] },
                    }
                    
                ):
                (
                    {
                        "sizeOne": {
                            "name": article.parameters.sizeOne.name,
                            "tags": article.parameters.sizeOne.tags,
                        },
                        "sizeTwo": {
                            "name": article.parameters.sizeTwo.name,
                            "tags": article.parameters.sizeTwo.tags,
                        },
                        "sizeThree": {
                            "name": article.parameters.sizeThree.name,
                            "tags": article.parameters.sizeThree.tags,
                        },
                        "wallOne": {
                            "name": article.parameters.wallOne.name,
                            "tags": article.parameters.wallOne.tags,
                        },
                        "wallTwo": {
                            "name": article.parameters.wallTwo.name,
                            "tags": article.parameters.wallTwo.tags,
                        },
                        "type": {
                            "name": article.parameters.type.name,
                            "tags": article.parameters.type.tags,
                        },
                        "grade": {
                            "name": article.parameters.grade.name,
                            "tags": article.parameters.grade.tags,
                        },
                        "length": {
                            "name": article.parameters.length.name,
                            "tags": article.parameters.length.tags,
                        },
                        "end": {
                            "name": article.parameters.end.name,
                            "tags": article.parameters.end.tags,
                        },
                        "surface": {
                            "name": article.parameters.surface.name,
                            "tags": article.parameters.surface.tags,
                        }
                    }
                )

            }});
        }
    });
}

const getAll = (req, res, next) => {
    
    const { filter, sort, dropdown } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;
    const system = req.body.system || "METRIC";
    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    
    matchDropdown(dropdown.opco, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface).then(myMatch => {
        Stock.aggregate([
            {
                $facet: {
                    "data": [
                        ...firstStage(myMatch, system, filter),
                        { 
                            "$sort": {
                                [!!sort.name ? sort.name : "gip"]: sort.isAscending === false ? -1 : 1,
                                "_id": 1
                            }
                        },
                        { "$skip": ((nextPage - 1) * pageSize) },
                        { "$limit": pageSize },
                        
                    ],
                    "pagination": [
                        ...firstStage(myMatch, system, filter),
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

const stockController = {
    getAll,
    getById
};

module.exports = stockController;