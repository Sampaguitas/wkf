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
            res.status(400).json({message: "Export failed." })
        });
    } else {
        res.status(400).json({ message: "export type not recognized."});
    }
}

const getById = (req, res, next) => {
    const {articleId} = req.params;
    const system = req.user.system || "METRIC";
    const currency = req.user.currency || "EUR";
    const rate = req.user.rate || 1;

    require("../models/Stock")
    .findById(articleId)
    .populate({
        "path": "location",
        "populate": {
            "path": "country"
        }
    })
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
                "qty": require("../functions/getQty")(system, article.uom, article.qty),
                "uom": require("../functions/getUom")(system, article.uom),
                "weight": require("../functions/getWeight")(system, article.uom, article.weight),
                "weight_uom": require("../functions/getWeightUom")(system),
                "price": {
                    "gip": require("../functions/getPrice")(system, article.uom, article.price.gip, rate),
                    "rv": require("../functions/getPrice")(system, article.uom, article.price.rv, rate),
                    "currency": currency
                },
                "purchase": {
                    "supplier": article.purchase.supplier,
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
                        "country": article.location.country.name,
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
    const system = "METRIC";
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
                "qty": require("../functions/getQty")(system, article.uom, article.qty),
                "weight": require("../functions/getWeight")(system, article.uom, article.weight),
                "price": {
                    "gip": require("../functions/getPrice")(system, article.uom, article.price.gip, 1),
                    "rv": require("../functions/getPrice")(system, article.uom, article.price.rv, 1),
                },
                "purchase": {
                    "supplier": article.purchase.supplier,
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
                        require("../functions/getQty")(system, article.uom, article.supplier.qtys[3]),
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
    
    const accountId = req.user.accountId;
    const system = req.user.system || "METRIC";
    const currency = req.user.currency || "EUR";
    const rate = req.user.rate || 1;

    matchDropdown(dropdown.opco, dropdown.artNr, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface, dropdown.stock, dropdown.supplier).then(myMatch => {
        require("../models/Stock").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/stock")(myMatch, accountId),
                        {
                            "$project": {
                                "parameters": 0,
                                "supplierNames": 0
                            }
                        },
                        { 
                            "$sort": {
                                [!!sort.name ? sort.name : "gip"]: sort.isAscending === false ? -1 : 1,
                                "_id": 1
                            }
                        },
                        { "$limit": pageSize + ((nextPage - 1) * pageSize) },
                        { "$skip": ((nextPage - 1) * pageSize) },
                        {
                            "$lookup": {
                                "from": "opcos",
                                "localField": "opco",
                                "foreignField": "stockInfo.capex_file_code",
                                "as": "opco"
                            }
                        },
                        {
                            "$addFields": {
                                "opco": { "$arrayElemAt": ["$opco", 0]}
                            }
                        },
                        {
                            "$addFields": {
                                "opco": "$opco.stockInfo.name",
                                "qty": {
                                    "$cond": [ 
                                        { "$eq": [system, "IMPERIAL"] },
                                        {
                                            "$switch": {
                                                "branches": [
                                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$qty", 2.204623 ] } },
                                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$qty", 3.28084 ] } }
                                                ],
                                                "default": "$qty"
                                            }
                                        },
                                        "$qty"
                                    ]
                                },
                                "firstInStock": {
                                    "$cond": [
                                        { "$eq": [system, "IMPERIAL" ] },
                                        {
                                            "$switch": {
                                                "branches": [
                                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$firstInStock", 2.204623 ] } },
                                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$firstInStock", 3.28084 ] } }
                                                ],
                                                "default": "$firstInStock"
                                            }
                                        },
                                        "$firstInStock"
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
                                                "default": "ST"
                                            }
                                        },
                                        "$uom"
                                    ],
                                },
                                "gip": {
                                    "$cond": [
                                        { "$eq": [ system, "IMPERIAL" ] },
                                        {
                                            "$switch": {
                                                "branches": [
                                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$gip", rate, 2.204623 ] } },
                                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$gip", rate, 3.28084 ] } }
                                                ],
                                                "default": { "$multiply": [ "$gip", rate ] }
                                            }
                                        },
                                        { "$multiply": [ "$gip", rate ] }
                                    ],
                                },
                                "rv": {
                                    "$cond": [
                                        { "$eq": [ system, "IMPERIAL" ] },
                                        {
                                            "$switch": {
                                                "branches": [
                                                    { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$rv", rate, 2.204623 ] } },
                                                    { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$rv", rate, 3.28084 ] } }
                                                ],
                                                "default": { "$multiply": [ "$rv", rate ] }
                                            }
                                        },
                                        { "$multiply": [ "$rv", rate ] }
                                    ],
                                },
                                "currency": currency,
                            }
                        }
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/stock")(myMatch, accountId),
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
            },
        ])
        .exec(function(error, result) {
            if (!!error || !result) {
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
    const {accountId} = req.user
    matchDropdown(dropdown.opco, dropdown.artNr, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface, dropdown.stock, dropdown.supplier).then(myMatch => {
        switch(key) {
            case "stock":
                let found = [ { "_id": true, "name": "available > 0"} ].filter(e => {
                    let myRegex = new RegExp(escape(name));
                    return !!name ? myRegex.test(e.name) : true;
                });
                if (found === undefined) {
                    res.status(200).json([])
                } else {
                    res.status(200).json(found)
                }
                break;
            case "artNr":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, accountId),
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": {"$first":`$$ROOT.${key}`},
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    }
                });
                break;
            case "opco":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, accountId),
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": {"$first":`$$ROOT.${key}`},
                        }
                    },
                    {
                        "$lookup": {
                            "from": "opcos",
                            "localField": "_id",
                            "foreignField": "stockInfo.capex_file_code",
                            "as": "opcos"
                        }
                    },
                    {
                        "$addFields": {
                            "opco": { "$arrayElemAt": ["$opcos", 0 ] }
                        }
                    },
                    {
                        "$project": {
                            "_id": 1,
                            "name": "$opco.stockInfo.name"
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    } 
                });
                break;
            case "steelType":
            case "pffType":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, accountId),
                    {
                        "$group": {
                            "_id": `$parameters.${key=== "steelType" ? "grade" : "type"}.${key}`,
                            "name":{"$first":`$$ROOT.parameters.${key=== "steelType" ? "grade" : "type"}.${key}`}
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    } 
                });
                break;
            case "type":
            case "grade":
            case "end":
            case "surface":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, accountId),
                    {
                        "$unwind": `$parameters.${key}.tags`
                    },
                    {
                        "$group": {
                            "_id": `$parameters.${key}.tags`,
                            "name": {"$first":`$$ROOT.parameters.${key}.tags`},
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    } 
                });
                break;
            case "sizeOne":
            case "wallOne":
            case "wallTwo":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, accountId),
                    {
                        "$project": {
                            "tags": `$parameters.${key}.tags`,
                            "mm": `$parameters.${key}.mm`,
                        }
                    },
                    {
                        "$unwind": {
                            "path": `$tags`,
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
                                        { "case": { "$regexMatch": { "input": `$tags`, "regex": /^(STD|XS|XXS)$/ } }, "then": 0 },
                                        { "case": { "$regexMatch": { "input": `$tags`, "regex": /^S\d*S?$/ } }, "then": 1 },
                                        { "case": { "$regexMatch": { "input": `$tags`, "regex": /^(\d| |\/)*"$/ } }, "then": 2 },
                                        { "case": { "$regexMatch": { "input": `$tags`, "regex": /^DN \d*$/ } }, "then": 3 },
                                        { "case": { "$regexMatch": { "input": `$tags`, "regex": /^(\d|\.)* mm$/ } }, "then": 4 },
                                        { "case": { "$regexMatch": { "input": `$tags`, "regex": /^(\d|\.)* in$/ } }, "then": 5 },
                                    ],
                                    "default": 6
                                }
                            }
                        }
                    },
                    {
                        "$group": {
                            "_id": `$tags`,
                            "unitIndex": { "$first": "$unitIndex" },
                            "mm": { "$first": `$mm` },
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
                        "$limit": 10 + (10 * page)
                    },
                    {
                        "$skip": 10 * page
                    },
                    {
                        "$project":{
                            "_id": 1,
                            "name": "$_id",
                        }
                    }
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    } 
                });
                break;
            case "sizeTwo":
                if (dropdown.pffType === "FORGED_OLETS" || regexOutlet.test(dropdown.type)) {
                    require("../models/Stock").aggregate([
                        ...require("../pipelines/first_stage/stock")(myMatch, accountId),
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
                                        "tags": 1,
                                        "mm": 1,
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
                                    "$limit": 10 + (10 * page)
                                },
                                {
                                    "$skip": 10 * page
                                },
                                {
                                    "$project":{
                                        "_id": 1,
                                        "name": "$_id",
                                    }
                                }
                            ]).exec(function(error, result) {
                                if (!!error || !result) {
                                    res.status(200).json([])
                                } else {
                                    res.status(200).json(result)
                                } 
                            });
                        }
                    });
                } else {
                    require("../models/Stock").aggregate([
                        ...require("../pipelines/first_stage/stock")(myMatch, accountId),
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
                            "$limit": 10 + (10 * page)
                        },
                        {
                            "$skip": 10 * page
                        },
                        {
                            "$project":{
                                "_id": 1,
                                "name": "$_id",
                            }
                        }
                    ]).exec(function(error, result) {
                        if (!!error || !result) {
                            res.status(200).json([])
                        } else {
                            res.status(200).json(result)
                        } 
                    });

                }
                break;
            case "length":
                require("../models/Stock").aggregate([
                    ...require("../pipelines/first_stage/stock")(myMatch, accountId),
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
                        "$limit": 10 + (10 * page)
                    },
                    {
                        "$skip": 10 * page
                    },
                    {
                        "$project":{
                            "_id": 1,
                            "name": "$_id",
                        }
                    }
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    } 
                });
                break;
            case "supplier": 
            require("../models/Stock").aggregate([
                ...require("../pipelines/first_stage/stock")(myMatch, accountId),
                {
                    "$unwind": "$supplierNames",
                },
                {
                    "$match": {
                        "supplierNames": { "$regex": new RegExp(escape(name),"i"), "$ne": "" }
                    }
                },
                {
                    "$group": {
                        "_id": `$supplierNames`,
                        "name": { "$first": `$supplierNames` },
                    }
                },
                {
                    "$sort": { "name": 1 },
                },
                {
                    "$limit": 10 + (10 * page)
                },
                {
                    "$skip": 10 * page
                }
            ]).exec(function(error, result) {
                if (!!error || !result) {
                    res.status(200).json([])
                } else {
                    res.status(200).json(result)
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
                    resolve(["opco", "artNr", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface", "stock", "supplier"].reduce(function(acc, cur, index) {
                        if (!!myArgs[index]) {
                            if (["opco", "artNr"].includes(cur)) {
                                acc[`${cur}`] = myArgs[index];
                            } else if (cur === "pffType") {
                                acc["parameters.type.pffType"] = myArgs[index];
                            } else if (cur === "steelType") {
                                acc["parameters.grade.steelType"] = myArgs[index];
                            } else if (cur === "sizeTwo" && mm !== null) {
                                acc["parameters.sizeTwo.mm"] = { $lte: mm };
                                acc["parameters.sizeThree.mm"] = { $gte: mm };
                            } else if (cur === "stock") {
                                acc["qty"] = { "$gt": 0 };
                            } else if (cur === "supplier") {
                                acc["supplier.names"] = myArgs[index];
                            } else {
                                acc[`parameters.${cur}.tags`] = myArgs[index];
                            }
                        }
                        return acc;
                    },{}));
                });
            } else {
                resolve(["opco", "artNr", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface", "stock", "supplier"].reduce(function(acc, cur, index) {
                    if (!!myArgs[index]) {
                        if (["opco", "artNr"].includes(cur)) {
                            acc[`${cur}`] = myArgs[index];
                        } else if (cur === "pffType") {
                            acc["parameters.type.pffType"] = myArgs[index];
                        } else if (cur === "steelType") {
                            acc["parameters.grade.steelType"] = myArgs[index];
                        } else if (cur === "stock") {
                            acc["qty"] = { "$gt": 0 };
                        } else if (cur === "supplier") {
                            acc["supplier.names"] = myArgs[index];
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