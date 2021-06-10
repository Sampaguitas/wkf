const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getById = (req, res, next) => {

    const {lengthId} = req.params;

    require("../models/Length").findById(lengthId, function (err, doc) {
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
    matchDropdown(dropdown.lunar, dropdown.name, dropdown.tags, dropdown.pffTypes, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        require("../models/Length").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/length")(myMatch, format),
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "unitIndex"]: sort.isAscending === false ? -1 : 1,
                                "name": 1,
                                "_id": 1
                            }
                        },
                        { "$limit": pageSize + ((nextPage - 1) * pageSize) },
                        { "$skip": ((nextPage - 1) * pageSize) },
                        {
                            "$lookup": {
                                "from": "users",
                                "localField": "createdBy",
                                "foreignField": "_id",
                                "as": "createdBy"
                            }
                        },
                        {
                            "$lookup": {
                                "from": "users",
                                "localField": "updatedBy",
                                "foreignField": "_id",
                                "as": "updatedBy"
                            }
                        },
                        {
                            "$addFields": {
                                "createdBy": { "$first": "$createdBy"},
                                "updatedBy": { "$first": "$updatedBy"},
                            }
                        },
                        {
                            "$project": {
                                "name": 1,
                                "createdBy": "$createdBy.name",
                                "updatedBy": "$updatedBy.name",
                                "createdAt": 1,
                                "updatedAt": 1,
                            }
                        }
                        // {
                        //     "$project": {
                        //         "name": 1
                        //     }
                        // }
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/length")(myMatch, format),
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
    matchDropdown(dropdown.lunar, dropdown.name, dropdown.tags, dropdown.pffTypes, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        switch(key) {
            case "length_tags":
                require("../models/Length").aggregate([
                    {
                        "$group": {
                            "_id": `$name`,
                            "name": {"$first":`$$ROOT.name`},
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
            case "length_pffTypes":
                require("../models/Pff").aggregate([
                    {
                        "$group": {
                            "_id": `$name`,
                            "name": {"$first":`$$ROOT.name`},
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
            case "name":
                require("../models/Length").aggregate([
                    ...require("../pipelines/first_stage/length")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": {"$first":`$$ROOT.${key}`},
                            "unitIndex": {"$first":`$$ROOT.unitIndex`},
                        }
                    },
                    {
                        "$match": {
                            "name": { "$regex": new RegExp(escape(name),"i") }
                        }
                    },
                    {
                        "$sort": {
                            "unitIndex": 1,
                            "name": 1
                        }
                    },
                    {
                        "$limit": 10 + (10 * page)
                    },
                    {
                        "$skip": 10 * page
                    },
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    }
                });
                break;
            case "lunar":
                require("../models/Length").aggregate([
                    ...require("../pipelines/first_stage/length")(myMatch, format),
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
                require("../models/Length").aggregate([
                    ...require("../pipelines/first_stage/length")(myMatch, format),
                    {
                        "$unwind": `$${key}`,
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
            case "createdBy":
            case "updatedBy":
                require("../models/Length").aggregate([
                    ...require("../pipelines/first_stage/length")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}`,
                        }
                    },
                    {
                        "$lookup": {
                            "from": "users",
                            "localField": `_id`,
                            "foreignField": "_id",
                            "as": "name"
                        }
                    },
                    {
                        "$addFields": {
                            "name": { "$first": "$name" }
                        }
                    },
                    {
                        "$project": {
                            "_id": 1,
                            "name": "$name.name"
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page, selectionArray)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        console.log("error: ", error);
                        res.status(200).json([])
                    } else {
                        console.log("result: ", result);
                        res.status(200).json(result)
                    }
                });
                break;
            case "createdAt":
            case "updatedAt":
                require("../models/Length").aggregate([
                    ...require("../pipelines/first_stage/length")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": { "$first": `$${key}` }
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page, selectionArray)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        console.log("error: ", error);
                        res.status(200).json([])
                    } else {
                        console.log("result: ", result);
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
        resolve(["lunar", "name", "tags", "pffTypes", "createdBy", "createdAt", "updatedBy", "updatedAt"].reduce(function(acc, cur, index) {
            if (myArgs[index] !== "") {
                if (["createdBy", "updatedBy"].includes(cur)) {
                    acc[`${cur}`] = ObjectId(myArgs[index]);
                } else {
                    acc[`${cur}`] = myArgs[index];
                }
            }
            return acc;
        },{}));
    });
}

const create = (req, res, next) => {
    
    const user = req.user;
    const { lunar, name, tags, pffTypes } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to create params"})
    } else if (!name || !pffTypes || pffTypes.length < 1 || !lunar) {
        res.status(400).json({message: "Name, PFF Types and lunar cannot be emty."})
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 2) {
        res.status(400).json({message: "Wrong lunar format."})
    } else {
        
        if (!tags.includes(name)) tags.push(name);

        let newLength = new require("../models/Length")({
            "lunar": lunar.toUpperCase(),
            "name": name,
            "tags": tags,
            "pffTypes": pffTypes,
            "createdBy": user._id,
            "updatedBy": user._id
        });

        newLength
        .save()
        .then( () => res.status(200).json({message: "Length has successfuly been created." }))
        .catch( () => res.status(400).json({message: "Length could not be created." }));
    }
}


const update = (req, res, next) => {
        
    const user = req.user;
    const {lengthId} = req.params;
    const { lunar, name, tags, pffTypes } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to update params."})
    } else if (!lengthId) {
        res.status(400).json({message: "Length ID is missing."});
    } else if (!lunar || !name || !pffTypes || pffTypes.length < 1) {
        res.status(400).json({message: "Name, PFF Types and lunar cannot be emty."});
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 2) {
        res.status(400).json({message: "Wrong lunar format."})
    } else {

        if (!tags.includes(name)) tags.push(name);
        
        let update = {
            "lunar": lunar.toUpperCase(),
            "name": name,
            "tags": tags,
            "pffTypes": pffTypes,
            "updatedBy": user._id
        };
        let options = { "new": true };
        require("../models/Length").findByIdAndUpdate(lengthId, update, options, function(errLength, length) {
            if (!!errLength || !length) {
                res.status(400).json({message: "Length could not be updated." });
            } else {
                res.status(200).json({message: "Length has successfuly been updated." });
            }
        });
    }
}

const _delete = (req, res, next) => {
        
    const user = req.user;
    const {lengthId} = req.params;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to delete params."})
    } else if (!lengthId) {
        res.status(400).json({message: "Length ID is missing."});
    } else {
        require("../models/Length").findByIdAndDelete(lengthId, function(errLength, length) {
            if (!!errLength || !length) {
                res.status(400).json({message: "Length could not be deleted." });
            } else {
                res.status(200).json({message: "Length has successfuly been deleted." });
            }
        });
    }
}

const lengthController = {
    getAll,
    getById,
    getDrop,
    create,
    update,
    _delete
};

module.exports = lengthController;