const getById = (req, res, next) => {

    const {surfaceId} = req.params;

    require("../models/Surface").findById(surfaceId, function (err, doc) {
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
        require("../models/Surface").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/surface")(myMatch, format),
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
                        ...require("../pipelines/first_stage/surface")(myMatch, format),
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
    const { dropdown, name } = req.body;
    let page = req.body.page || 0;
    const {key} = req.params;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    matchDropdown(dropdown.lunar, dropdown.name, dropdown.tags, dropdown.pffTypes, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        switch(key) {
            case "surface_tags":
                require("../models/Surface").aggregate([
                    {
                        "$group": {
                            "_id": `$name`,
                            "name": {"$first":`$$ROOT.name`},
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
            case "surface_pffTypes":
                require("../models/Pff").aggregate([
                    {
                        "$group": {
                            "_id": `$name`,
                            "name": {"$first":`$$ROOT.name`},
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
            case "name":
            case "lunar":
                require("../models/Surface").aggregate([
                    ...require("../pipelines/first_stage/surface")(myMatch, format),
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
            case "tags":
            case "pffTypes":
                require("../models/Surface").aggregate([
                    ...require("../pipelines/first_stage/surface")(myMatch, format),
                    {
                        "$unwind": `$${key}`
                    },
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
            case "createdBy":
            case "updatedBy":
                require("../models/Surface").aggregate([
                    ...require("../pipelines/first_stage/surface")(myMatch, format),
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
                    ...require("../pipelines/projection/drop")(name, page)
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
                require("../models/Surface").aggregate([
                    ...require("../pipelines/first_stage/surface")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": { "$first": `$${key}` }
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
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
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 6) {
        res.status(400).json({message: "Wrong lunar format."})
    } else {
        
        if (!tags.includes(name)) tags.push(name);

        let newSurface = new require("../models/Surface")({
            "lunar": lunar.toUpperCase(),
            "name": name,
            "tags": tags,
            "pffTypes": pffTypes,
            "createdBy": user._id,
            "updatedBy": user._id
        });

        newSurface
        .save()
        .then( () => res.status(200).json({message: "Surface has successfuly been created." }))
        .catch( () => res.status(400).json({message: "Surface could not be created." }));
    }
}


const update = (req, res, next) => {
        
    const user = req.user;
    const {surfaceId} = req.params;
    const { lunar, name, tags, pffTypes } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to update params."})
    } else if (!surfaceId) {
        res.status(400).json({message: "Surface ID is missing."});
    } else if (!lunar || !name || !pffTypes || pffTypes.length < 1) {
        res.status(400).json({message: "Name, PFF Types and lunar cannot be emty."});
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 6) {
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
        require("../models/Surface").findByIdAndUpdate(surfaceId, update, options, function(errSurface, surface) {
            if (!!errSurface || !surface) {
                res.status(400).json({message: "Surface could not be updated." });
            } else {
                res.status(200).json({message: "Surface has successfuly been updated." });
            }
        });
    }
}

const _delete = (req, res, next) => {
        
    const user = req.user;
    const {surfaceId} = req.params;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to delete params."})
    } else if (!surfaceId) {
        res.status(400).json({message: "Surface ID is missing."});
    } else {
        require("../models/Surface").findByIdAndDelete(surfaceId, function(errSurface, surface) {
            if (!!errSurface || !surface) {
                res.status(400).json({message: "Surface could not be deleted." });
            } else {
                res.status(200).json({message: "Surface has successfuly been deleted." });
            }
        });
    }
}

const surfaceController = {
    getAll,
    getById,
    getDrop,
    create,
    update,
    _delete
};

module.exports = surfaceController;