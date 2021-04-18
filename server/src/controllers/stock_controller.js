const Stock = require("../models/Stock");
const Export = require("../models/Export");
const projectionResult = require("../pipelines/projections/projection_result");
const projectionDropSorted = require("../pipelines/projections/projection_drop_sorted");
const projectionDropUnsorted = require("../pipelines/projections/projection_drop_unsorted");
const firstStage = require("../pipelines/stock_pipelines/first_stage");
const escape = require("../functions/escape");
var moment = require('moment');

const _export = (req, res, next) => {
    const { type } = req.params;
    const user = req.user;
    const { filter, sort, dropdown } = req.body;
    const system = req.body.system || "METRIC";

    if (["stocks", "params"].includes(type)) {
        let newExport = new Export({
            type,
            system,
            stockFilters: {
                filter,
                dropdown,
                sort
            },
            status: "pending",
            createdBy: user._id
        });

        newExport
        .save()
        .then( () => res.status(200).json({message: "Export in progress." }))
        .catch( (err) => {
            console.log("err:", err)
            res.status(400).json({message: "Export failed." })
        });
    } else {
        res.status(400).json({ message: "export type not recognized."});
    }
}

const getById = (req, res, next) => {

    const {articleId} = req.params;
    const { system } = decodeURI(req.query.system);

    Stock.findById(articleId, function (err, article) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."});
        } if (!article) {
            res.status(400).json({ message: "Could not retrieve article information." });
        } else {
            // res.json({article: article});
            res.json({article: {
                "opco": article.opco,
                "artNr": article.artNr,
                "description": article.description,
                "vlunar": article.vlunar,
                "qty": require("../functions/getQty")(system, article.uom, article.qty),
                "uom": require("../functions/getUom")(system, article.uom),
                "weight": require("../functions/getWeight")(system, article.uom, article.weight),
                "price": {
                    "gip": require("../functions/getPrice")(system, article.uom, article.price.gip, 1),
                    "rv": require("../functions/getPrice")(system, article.uom, article.price.rv, 1),
                },
                "purchase": {
                    "supplier": "",
                    "qty": require("../functions/getQty")(system, article.uom, article.purchase.qty),
                    "firstInStock": require("../functions/getQty")(system, article.uom, article.purchase.firstInStock),
                    "deliveryDate": article.purchase.deliveryDate
                },
                "supplier": {
                    "names": article.supplier.names,
                    "qtys": [
                        require("../functions/getQty")(system, article.uom, article.supplier.qtys[0]),
                        require("../functions/getQty")(system, article.uom, article.supplier.qtys[1]),
                        require("../functions/getQty")(system, article.uom, article.supplier.qtys[2]),
                        require("../functions/getQty")(system, article.uom, article.supplier.qtys[3])
                    ]
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

const getByArt = (req, res, next) => {
    const {opco, artNr} = req.params;
    const system = decodeURI(req.query.system);
    Stock.findOne({opco, artNr}, function(err, article) {
        if (!!err || !article) {
            res.status(200).json({
                "description": "",
                "qty": "",
                "weight": "",
                "price": { "gip": "", "rv": "" },
                "purchase": { "supplier": "", "qty": "", "firstInStock": "", "deliveryDate": "" },
                "supplier": {
                    "names": ["", "", "", "" ],
                    "qtys": [ "", "", "", "" ]
                }
            });
        } else {
            res.status(200).json({
                "description": article.description,
                "qty": require("../functions/getQty")(system, article.uom, article.qty),
                "weight": require("../functions/getWeight")(system, article.uom, article.weight),
                "price": {
                    "gip": require("../functions/getPrice")(system, article.uom, article.price.gip, 1),
                    "rv": require("../functions/getPrice")(system, article.uom, article.price.rv, 1),
                },
                "purchase": {
                    "supplier": "",
                    "qty": require("../functions/getQty")(system, article.uom, article.purchase.qty),
                    "firstInStock": require("../functions/getQty")(system, article.uom, article.purchase.firstInStock),
                    "deliveryDate": !!article.purchase.deliveryDate ? moment(article.purchase.deliveryDate).format("LL") : ""
                },
                "supplier": {
                    "names": article.supplier.names,
                    "qtys": [
                        require("../functions/getQty")(system, article.uom, article.supplier.qtys[0]),
                        require("../functions/getQty")(system, article.uom, article.supplier.qtys[1]),
                        require("../functions/getQty")(system, article.uom, article.supplier.qtys[2]),
                        require("../functions/getQty")(system, article.uom, article.supplier.qtys[3])
                    ]
                }
            });
        }
    });
}

const getAll = (req, res, next) => {
    
    const { filter, sort, dropdown } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;
    const system = req.body.system || "METRIC";
    
    matchDropdown(dropdown.opco, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface).then(myMatch => {
        Stock.aggregate([
            {
                $facet: {
                    "data": [
                        ...firstStage(myMatch, system, filter),
                        {
                            "$project": {
                                "parameters": 0,
                            }
                        },
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

const getDrop = (req, res, next) => {
    const { filter, dropdown, name } = req.body;
    const {key} = req.params;

    let page = req.body.page || 0;
    const system = req.body.system || "METRIC";

    matchDropdown(dropdown.opco, dropdown.artNr, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface).then(myMatch => {
        switch(key) {
            case "opco":
            case "artNr":
                Stock.aggregate([
                    ...firstStage(myMatch, system, filter),
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$addToSet": `$${key}`}
                        }
                    },
                    ...projectionDropSorted(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    } 
                });
                break;
            case "steelType":
            case "pffType":
                Stock.aggregate([
                    ...firstStage(myMatch, system, filter),
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$addToSet": `$parameters.${key=== "steelType" ? "grade" : "type"}.${key}`}
                        }
                    },
                    ...projectionDropSorted(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    } 
                });
                break;
            case "type":
            case "grade":
            case "end":
            case "surface":
                Stock.aggregate([
                    ...firstStage(myMatch, system, filter),
                    {
                        "$project": {
                            "data": `$parameters.${key}.tags`
                        }
                    },
                    {
                        "$unwind": "$data"
                    },
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$addToSet": `$data`}
                        }
                    },
                    ...projectionDropSorted(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    } 
                });
                break;
            case "sizeOne":
                Stock.aggregate([
                    ...firstStage(myMatch, system, filter),
                    {
                        "$project": {
                            "tags": `$parameters.${key}.tags`,
                            "mm": `$parameters.${key}.mm`,
                        }
                    },
                    {
                        "$unwind": "$tags"
                    },
                    {
                        "$match": {
                            "tags": { "$regex": new RegExp(escape(name),"i") }
                        }
                    },
                    {
                        "$sort": {
                            "mm": 1,
                        }
                    },
                    {
                        "$group": {
                            "_id": null,
                            "nps":{
                                "$addToSet": {
                                    "$cond":[ { "$regexMatch": { "input": "$tags", "regex": /^(\d| |\/)*"$/ } }, "$tags", "$$REMOVE" ]
                                }
                            },
                            "dn": {
                                "$addToSet": {
                                    "$cond":[ { "$regexMatch": { "input": "$tags", "regex": /^DN \d*$/ } }, "$tags", "$$REMOVE" ]
                                }
                            },
                            "mm": {
                                "$addToSet": {
                                    "$cond":[ { "$regexMatch": { "input": "$tags", "regex": /^(\d|\.)* mm$/ } }, "$tags", "$$REMOVE" ]
                                }
                            },
                            "in": {
                                "$addToSet": {
                                    "$cond":[ { "$regexMatch": { "input": "$tags", "regex": /^(\d|\.)* in$/ } }, "$tags", "$$REMOVE" ]
                                }
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": null,
                            "data": { "$concatArrays": [ "$nps", "$dn", "$mm", "$in" ] }
                        }
                    },
                    {
                        "$unwind": "$data"
                    },
                    {
                        "$skip": 10 * page
                    },
                    {
                        "$limit": 10
                    },
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$push": `$data`}
                        }
                    },
                    {
                        "$project":{
                            "_id": 0
                        }
                    }
                    // ...projectionDropUnsorted(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    } 
                });
                break;
            default: res.status(200).json([]);
        }
    });
}


function matchDropdown() {
    let myArgs = arguments;
    return new Promise(function(resolve) {
            let regexOutlet = /^(ELBOL|ELBOWFL|LATROFL|LATROL|NIPOFL|NIPOL|SOCKOL|SWEEPOL|THREADOL|WELDOL)( \d*)?$/
            if (regexOutlet.test(myArgs[7])) {
                require("../functions/getSizeMm")(myArgs[4]).then(mm => {
                    resolve(["opco", "artNr", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface"].reduce(function(acc, cur, index) {
                        if (!!myArgs[index]) {
                            if (["opco", "artNr"].includes(cur)) {
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
                resolve(["opco", "artNr", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface"].reduce(function(acc, cur, index) {
                    if (!!myArgs[index]) {
                        if (["opco", "artNr"].includes(cur)) {
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
    _export,
    getAll,
    getDrop,
    getByArt,
    getById
};

module.exports = stockController;