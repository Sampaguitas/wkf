const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getById = (req, res, next) => {

    const {wallId} = req.params;

    require("../models/Wall").findById(wallId, function (err, doc) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!doc) {
            res.status(400).json({ message: "Could not retrieve export information." });
        } else {
            res.json({doc: doc});
        }
    });
}

const getAll = (req, res, next) => {
    
    const { dropdown, sort } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    matchDropdown(dropdown.sizeId, dropdown.lunar, dropdown.mm, dropdown.idt, dropdown.sch, dropdown.schS, dropdown.tags, dropdown.pffTypes, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        require("../models/Wall").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/wall")(myMatch, format),
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "size"]: sort.isAscending === false ? -1 : 1,
                                "mm": 1,
                                "_id": 1
                            }
                        },
                        { "$limit": pageSize + ((nextPage - 1) * pageSize) },
                        { "$skip": ((nextPage - 1) * pageSize) },
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/wall")(myMatch, format),
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
                "$project": require("../pipelines/projection/result")(nextPage, pageSize)
            }
        ]).exec(function(error, result) {
            if (!!error || !result) {
                res.status(200).json([])
            } else {
                res.status(200).json(result)
            } 
        });
    });
}

const getDrop = (req, res, next) => {
    const { dropdown, name, selectionArray } = req.body;
    let page = req.body.page || 0;
    const {key} = req.params;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    matchDropdown(dropdown.sizeId, dropdown.lunar, dropdown.mm, dropdown.idt, dropdown.sch, dropdown.schS, dropdown.tags, dropdown.pffTypes, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        switch(key) {
            case "sizeId":
                require("../models/Wall").aggregate([
                    ...require("../pipelines/first_stage/wall")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}X`,
                            "name": {"$first":`$$ROOT.${key}X`},
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page, selectionArray)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    }
                });
                break;
            case "lunar":
                require("../models/Wall").aggregate([
                    ...require("../pipelines/first_stage/wall")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": {"$first":`$$ROOT.${key}`},
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page, selectionArray)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    }
                });
                break;
            case "tags":
            case "pffTypes":
                require("../models/Wall").aggregate([
                    ...require("../pipelines/first_stage/wall")(myMatch, format),
                    {
                        "$unwind": `$${key}`
                    },
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": {"$first":`$$ROOT.${key}`},
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page, selectionArray)
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
        resolve(["sizeId", "lunar", "mm", "idt", "sch", "schS", "tags", "pffTypes", "createdBy", "createdAt", "updatedBy", "updatedAt"].reduce(function(acc, cur, index) {
            if (myArgs[index] !== "") {
                if (["createdBy", "updatedBy"].includes(cur)) {
                    acc[`${cur}`] = ObjectId(myArgs[index]);
                } else if (["sizeId", "mm"].includes(cur)) {
                    acc[`${cur}X`] = myArgs[index];
                } else {
                    acc[`${cur}`] = myArgs[index];
                }
            }
            return acc;
        },{}));
    });
}

const wallController = {
    getAll,
    getById,
    getDrop
};

module.exports = wallController;