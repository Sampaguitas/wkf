const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getById = (req, res, next) => {

    const {specId} = req.params;

    require("../models/Spec").findById(specId, function (err, doc) {
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
    matchDropdown(dropdown.name, dropdown.createdBy, dropdown.updatedBy, dropdown.createdAt, dropdown.updatedAt).then(myMatch => {
        require("../models/Spec").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/spec")(myMatch, format),
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "name"]: sort.isAscending === false ? -1 : 1,
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
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/spec")(myMatch, format),
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
    matchDropdown(dropdown.name, dropdown.createdBy, dropdown.updatedBy, dropdown.createdAt, dropdown.updatedAt).then(myMatch => {
        switch(key) {
            case "name":
                require("../models/Spec").aggregate([
                    ...require("../pipelines/first_stage/spec")(myMatch, format),
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
                require("../models/Spec").aggregate([
                    ...require("../pipelines/first_stage/spec")(myMatch, format),
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
                require("../models/Spec").aggregate([
                    ...require("../pipelines/first_stage/spec")(myMatch, format),
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
        resolve(["name", "createdBy", "updatedBy", "createdAt", "updatedAt"].reduce(function(acc, cur, index) {
            if (!!myArgs[index]) {
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
    const { name } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to create params"})
    } else if (!name) {
        res.status(400).json({message: "Spec name cannot be emty."})
    } else {
        let newSpec = new require("../models/Spec")({
            "name": name,
            "createdBy": user._id,
            "updatedBy": user._id
        });

        newSpec
        .save()
        .then( () => res.status(200).json({message: "Spec Type has successfuly been created." }))
        .catch( () => res.status(400).json({message: "Spec Type could not be created." }));
    }
}


const update = (req, res, next) => {
        
    const user = req.user;
    const {specId} = req.params;
    const { name } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to update params."})
    } else if (!specId) {
        res.status(400).json({message: "Spec ID is missing."});
    } else if (!name) {
        res.status(400).json({message: "Spec name cannot be emty."})
    } else {
        let update = { "name": name, "updatedBy": user._id };
        let options = { "new": true };
        require("../models/Spec").findByIdAndUpdate(specId, update, options, function(errSpec, spec) {
            if (!!errSpec || !spec) {
                res.status(400).json({message: "Spec Type could not be updated." });
            } else {
                res.status(200).json({message: "Spec  Type has successfuly been updated." });
            }
        });
    }
}

const _delete = (req, res, next) => {
        
    const user = req.user;
    const {specId} = req.params;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to delete params."})
    } else if (!specId) {
        res.status(400).json({message: "Spec ID is missing."});
    } else {
        require("../models/Spec").findByIdAndDelete(specId, function(errSpec, spec) {
            if (!!errSpec || !spec) {
                res.status(400).json({message: "Spec Type could not be deleted." });
            } else {
                res.status(200).json({message: "Spec Type has successfuly been deleted." });
            }
        });
    }
}

const specController = {
    getAll,
    getById,
    getDrop,
    create,
    update,
    _delete
};

module.exports = specController;