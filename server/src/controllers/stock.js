const escape = require("../functions/escape");
var moment = require('moment');

let regexOutlet = /^(ELBOL|ELBOWFL|LATROFL|LATROL|NIPOFL|NIPOL|SOCKOL|SWEEPOL|THREADOL|WELDOL)( \d*)?$/

const _export = (req, res, next) => {
    const { type } = req.params;
    const user = req.user;
    const { sort, dropdown, selectedIds } = req.body;

    if (["stocks", "params"].includes(type)) {
        let newExport = new require("../models/Export")({
            type,
            stockFilters: {
                dropdown,
                sort,
                selectedIds
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
    require("../models/Stock")
    .findById(articleId)
    .populate("location")
    .exec(function (err, article) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."});
        } if (!article) {
            res.status(400).json({ message: "Could not retrieve article information." });
        } else {
            res.json({article: {
                "opco": article.opco,
                "artNr": article.artNr,
                "description": article.description,
                "vlunar": article.vlunar,
                "qty": article.qty,
                "uom": article.uom,
                "weight": article.weight,
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
                    "qtys": [
                        article.supplier.qtys[0],
                        article.supplier.qtys[1],
                        article.supplier.qtys[2],
                        article.supplier.qtys[3]
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
                ),
                "location": !article.location ? (
                    {
                        "title": "",
                        "address": "",
                        "postalcode": "",
                        "city": "",
                        "country": "",
                        "tel": "",
                        "fax": "",
                        "email": "",
                        "price_info": ""
                    }
                )
                :
                (
                    {
                        "title": article.location.title,
                        "address": article.location.address,
                        "postalcode": article.location.postalcode,
                        "city": article.location.city,
                        "country": article.location.country,
                        "tel": article.location.tel,
                        "fax": article.location.fax,
                        "email": article.location.email,
                        "price_info": !!article.location.stockInfo ? article.location.stockInfo.intercompany_price_information : "",
                    }
                )
            }});
        }
    });
}

const getByArt = (req, res, next) => {
    const {opco, artNr} = req.params;
    require("../models/Stock")
    .findOne({opco, artNr})
    .exec(function(err, article) {
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
                "qty": article.qty,
                "weight": article.weight,
                "price": {
                    "gip": article.price.gip,
                    "rv": article.price.rv,
                },
                "purchase": {
                    "supplier": article.purchase.supplier,
                    "qty": article.purchase.qty,
                    "firstInStock": article.purchase.firstInStock,
                    "deliveryDate": !!article.purchase.deliveryDate ? moment(article.purchase.deliveryDate).format("LL") : ""
                },
                "supplier": {
                    "names": article.supplier.names,
                    "qtys": [
                        article.supplier.qtys[0],
                        article.supplier.qtys[1],
                        article.supplier.qtys[2],
                        article.supplier.qtys[3]
                    ]
                }
            });
        }
    });
}

const getAll = (req, res, next) => {
    
    const { sort, dropdown } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;
    const user = req.user
    matchDropdown(dropdown.opco, dropdown.artNr, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface).then(myMatch => {
        require("../models/Stock").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
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
                        ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
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
                $project: require("../pipelines/projection/result")(nextPage, pageSize)
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
    const { dropdown, name } = req.body;
    const {key} = req.params;
    let page = req.body.page || 0;
    const user = req.user
    matchDropdown(dropdown.opco, dropdown.artNr, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface).then(myMatch => {
        switch(key) {
            case "opco":
            case "artNr":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$addToSet": `$${key}`}
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
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
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$addToSet": `$parameters.${key=== "steelType" ? "grade" : "type"}.${key}`}
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    } 
                });
                break;
            case "type":
            case "end":
            case "surface":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
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
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    } 
                });
                break;
            case "grade":
                // require("../models/Grade").aggregate([
                //     {
                //         "$match": {
                //             "isMultiple": { "$ne": true }
                //         }
                //     },
                //     {
                //         "$group": {
                //             "_id": null,
                //             "data":{ "$addToSet": `$name`}
                //         }
                //     },
                //     {
                //         "$project":{
                //             "_id": 0
                //         }
                //     }
                // ]).exec(function(err, uniques) {
                //     if (!!err || uniques.length !== 1 || !uniques[0].hasOwnProperty("data")) {
                //         res.status(200).json([])
                //     } else {
                        require("../models/Stock").aggregate([
                            ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
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
                            // {
                            //     "$project": {
                            //         "data": { "$setIntersection":  [ uniques[0].data, "$data"] }
                            //     }
                            // },
                            ...require("../pipelines/projection/drop")(name, page)
                        ]).exec(function(error, result) {
                            if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                                res.status(200).json([]);
                            } else {
                                res.status(200).json(result[0].data);
                            } 
                        }); 
                    // }
                // });
                
                break;
            case "sizeOne":
            case "wallOne":
            case "wallTwo":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
                    {
                        "$project": {
                            "tags": `$parameters.${key}.tags`,
                            "mm": `$parameters.${key}.mm`,
                        }
                    },
                    {
                        "$unwind": {
                            "path": "$tags",
                            "includeArrayIndex": "arrayIndex"
                        }
                    },
                    {
                        "$match": {
                            "tags": { "$regex": new RegExp(escape(name),"i") }
                        }
                    },
                    {
                        "$addFields": {
                            "unitIndex": {
                                "$switch": {
                                    "branches": [
                                        { "case": { "$regexMatch": { "input": "$tags", "regex": /^(STD|XS|XXS)$/ } }, "then": 0 },
                                        { "case": { "$regexMatch": { "input": "$tags", "regex": /^S\d*S?$/ } }, "then": 1 },
                                        { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d| |\/)*"$/ } }, "then": 2 },
                                        { "case": { "$regexMatch": { "input": "$tags", "regex": /^DN \d*$/ } }, "then": 3 },
                                        { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d|\.)* mm$/ } }, "then": 4 },
                                        { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d|\.)* in$/ } }, "then": 5 },
                                    ],
                                    "default": 6
                                }
                            }
                        }
                    },
                    {
                        "$group": {
                            "_id": "$tags",
                            "unitIndex": { "$first": "$unitIndex" },
                            "mm": { "$first": "$mm" },
                            "arrayIndex": { "$first": "$arrayIndex" }
                        }
                    },
                    {
                        "$sort": {
                            "unitIndex": 1,
                            "mm": 1,
                            "arrayIndex": 1
                        }
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
                            "data": { "$push": "$_id" }
                        }
                    },
                    {
                        "$project":{
                            "_id": 0
                        }
                    }
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    }
                });
                break;
            case "sizeTwo":
                if (dropdown.pffType === "FORGED_OLETS" || regexOutlet.test(dropdown.type)) {
                    require("../models/Stock").aggregate([
                        ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
                        {
                            "$group": {
                                "_id": null,
                                "min": { "$min": "$parameters.sizeTwo.mm" },
                                "max": { "$max": "$parameters.sizeThree.mm" },
                            }
                        },
                        {
                            "$project":{
                                "_id": 0
                            }
                        }
                    ]).exec(function(errTemp, temp) {
                        if (!!errTemp || temp.length !== 1 || !temp[0].hasOwnProperty("min") || !temp[0].hasOwnProperty("max")) {
                            res.status(200).json([]);
                        } else {
                            console.log("min:", temp[0].min);
                            console.log("max:", temp[0].max);
                            require("../models/Size").aggregate([
                                {
                                    "$match": {
                                        "mm": { 
                                            "$gte": Number(temp[0].min),
                                            "$lte": Number(temp[0].max)
                                        },
                                        "pffTypes": "FORGED_OLETS"
                                    }
                                },
                                {
                                    "$project": {
                                        "tags": "$tags",
                                        "mm": "$mm",
                                    }
                                },
                                {
                                    "$unwind": {
                                        "path": "$tags",
                                        "includeArrayIndex": "arrayIndex"
                                    }
                                },
                                {
                                    "$match": {
                                        "tags": { "$regex": new RegExp(escape(name),"i") }
                                    }
                                },
                                {
                                    "$addFields": {
                                        "unitIndex": {
                                            "$switch": {
                                                "branches": [
                                                    { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d| |\/)*"$/ } }, "then": 0 },
                                                    { "case": { "$regexMatch": { "input": "$tags", "regex": /^DN \d*$/ } }, "then": 1 },
                                                    { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d|\.)* mm$/ } }, "then": 2 },
                                                    { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d|\.)* in$/ } }, "then": 3 },
                                                ],
                                                "default": 4
                                            }
                                        }
                                    }
                                },
                                {
                                    "$group": {
                                        "_id": "$tags",
                                        "unitIndex": { "$first": "$unitIndex" },
                                        "mm": { "$first": "$mm" },
                                        "arrayIndex": { "$first": "$arrayIndex" }
                                    }
                                },
                                {
                                    "$sort": {
                                        "unitIndex": 1,
                                        "mm": 1,
                                        "arrayIndex": 1
                                    }
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
                                        "data": { "$push": "$_id" }
                                    }
                                },
                                {
                                    "$project":{
                                        "_id": 0
                                    }
                                }
                            ]).exec(function(error, result) {
                                if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                                    res.status(200).json([]);
                                } else {
                                    res.status(200).json(result[0].data);
                                }
                            });
                        } 
                    });
                } else {
                    require("../models/Stock").aggregate([
                        ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
                        {
                            "$project": {
                                "tags": `$parameters.${key}.tags`,
                                "mm": `$parameters.${key}.mm`,
                            }
                        },
                        {
                            "$unwind": {
                                "path": "$tags",
                                "includeArrayIndex": "arrayIndex"
                            }
                        },
                        {
                            "$match": {
                                "tags": { "$regex": new RegExp(escape(name),"i") }
                            }
                        },
                        {
                            "$addFields": {
                                "unitIndex": {
                                    "$switch": {
                                        "branches": [
                                            { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d| |\/)*"$/ } }, "then": 0 },
                                            { "case": { "$regexMatch": { "input": "$tags", "regex": /^DN \d*$/ } }, "then": 1 },
                                            { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d|\.)* mm$/ } }, "then": 2 },
                                            { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d|\.)* in$/ } }, "then": 3 },
                                        ],
                                        "default": 4
                                    }
                                }
                            }
                        },
                        {
                            "$group": {
                                "_id": "$tags",
                                "unitIndex": { "$first": "$unitIndex" },
                                "mm": { "$first": "$mm" },
                                "arrayIndex": { "$first": "$arrayIndex" }
                            }
                        },
                        {
                            "$sort": {
                                "unitIndex": 1,
                                "mm": 1,
                                "arrayIndex": 1
                            }
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
                                "data": { "$push": "$_id" }
                            }
                        },
                        {
                            "$project":{
                                "_id": 0
                            }
                        }
                    ]).exec(function(error, result) {
                        if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                            res.status(200).json([]);
                        } else {
                            res.status(200).json(result[0].data);
                        } 
                    });

                }
                break;
            case "length":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, user.accountId),
                    {
                        "$project": {
                            "tags": `$parameters.${key}.tags`,
                        }
                    },
                    {
                        "$unwind": {
                            "path": "$tags"
                        }
                    },
                    {
                        "$match": {
                            "tags": { "$regex": new RegExp(escape(name),"i") }
                        }
                    },
                    {
                        "$addFields": {
                            "unitIndex": {
                                "$switch": {
                                    "branches": [
                                        { "case": { "$regexMatch": { "input": "$tags", "regex": /^(SRL|DRL)$/ } }, "then": 0 },
                                        { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d|\.)* mm$/ } }, "then": 1 },
                                        { "case": { "$regexMatch": { "input": "$tags", "regex": /^(\d| |\/)*"$/ } }, "then": 2 },
                                        
                                    ],
                                    "default": 3
                                }
                            }
                        }
                    },
                    {
                        "$group": {
                            "_id": "$tags",
                            "unitIndex": { "$first": "$unitIndex" }
                        }
                    },
                    {
                        "$sort": {
                            "unitIndex": 1,
                            "_id": 1
                        }
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
                            "data": { "$push": "$_id" }
                        }
                    },
                    {
                        "$project":{
                            "_id": 0
                        }
                    }
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
            if (regexOutlet.test(myArgs[8]) || myArgs[2] === "FORGED_OLETS") {
                require("../functions/getSizeMm")(myArgs[5]).then(mm => {
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