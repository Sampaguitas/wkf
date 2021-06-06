const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getById = (req, res, next) => {

    const {typeId} = req.params;

    require("../models/Type").findById(typeId, function (err, doc) {
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
    matchDropdown(dropdown.lunar, dropdown.name, dropdown.tags, dropdown.specs, dropdown.pffType, dropdown.isComplete, dropdown.isMultiple, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        require("../models/Type").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/type")(myMatch, format),
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
                                "pffType": 1,
                                "createdBy": "$createdBy.name",
                                "updatedBy": "$updatedBy.name",
                                "createdAt": 1,
                                "updatedAt": 1,
                            }
                        }
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/type")(myMatch, format),
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

    matchDropdown(dropdown.lunar, dropdown.name, dropdown.tags, dropdown.specs, dropdown.pffType, dropdown.isComplete, dropdown.isMultiple, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        
        switch(key) {
            case "type_tags":
                require("../models/Type").aggregate([
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
            case "type_specs":
                require("../models/Spec").aggregate([
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
            case "type_pffType":
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
            case "type_isComplete":
            case "type_isMultiple":
                let foundOne = [ { "_id": true, "name": "true"}, { "_id": false, "name": "false"} ].filter(e => {
                    let myRegex = new RegExp(escape(name));
                    return !!name ? myRegex.test(e.name) : true;
                });
                if (foundOne === undefined) {
                    res.status(200).json([]);
                } else {
                    res.status(200).json(foundOne);
                }
                break;
            case "lunar":
            case "name":
            case "pffType":
                require("../models/Type").aggregate([
                    ...require("../pipelines/first_stage/type")(myMatch, format),
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
            case "specs":
                require("../models/Type").aggregate([
                    ...require("../pipelines/first_stage/type")(myMatch, format),
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
            case "isComplete":
            case "isMultiple":
                let foundTwo = [ { "_id": true, "name": "true"}, { "_id": false, "name": "false"} ].filter(e => {
                    let myRegex = new RegExp(escape(name));
                    return !!name ? myRegex.test(e.name) : true;
                });
                if (foundTwo === undefined) {
                    res.status(200).json([])
                } else {
                    res.status(200).json(foundTwo)
                }
                break;
            case "createdBy":
            case "updatedBy":
                require("../models/Type").aggregate([
                    ...require("../pipelines/first_stage/type")(myMatch, format),
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
                require("../models/Type").aggregate([
                    ...require("../pipelines/first_stage/type")(myMatch, format),
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
        resolve(["lunar", "name", "tags", "specs", "pffType", "isComplete", "isMultiple", "createdBy", "createdAt", "updatedBy", "updatedAt"].reduce(function(acc, cur, index) {
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
    const { name, pffType, isComplete, isMultiple, lunar, tags, specs } = req.body;
    
    
    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to create params"})
    } else if (!name || !pffType || !specs || specs.length < 1 || !lunar) {
        res.status(400).json({message: "Name, PFF Type, Specs and lunar cannot be emty."})
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 3) {
        res.status(400).json({message: "Wrong lunar format."})
    } else {
        
        if (!tags.includes(name)) tags.push(name);

        let newType = new require("../models/Type")({
            "name": name,
            "pffType": pffType,
            "isComplete": isComplete || false,
            "isMultiple": isMultiple || false,
            "lunar": lunar.toUpperCase(),
            "tags": tags,
            "specs": specs,
            "createdBy": user._id,
            "updatedBy": user._id
        });

        newType
        .save()
        .then( () => res.status(200).json({message: "Type has successfuly been created." }))
        .catch( () => res.status(400).json({message: "Type could not be created." }));
    }
}


const update = (req, res, next) => {
        
    const user = req.user;
    const {typeId} = req.params;
    const { name, pffType, isComplete, isMultiple, lunar, tags, specs } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to update params."})
    } else if (!typeId) {
        res.status(400).json({message: "Type ID is missing."});
    } else if (!name || !pffType || !lunar) {
        res.status(400).json({message: "Name, PFF Type and lunar cannot be emty."});
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 3) {
        res.status(400).json({message: "Wrong lunar format."})
    } else {

        if (!tags.includes(name)) tags.push(name);
        
        let update = {
            "name": name,
            "pffType": pffType,
            "isComplete": isComplete || false,
            "isMultiple": isMultiple || false,
            "lunar": lunar.toUpperCase(),
            "tags": tags,
            "specs": specs,
            "updatedBy": user._id
        };
        let options = { "new": true };
        require("../models/Type").findByIdAndUpdate(typeId, update, options, function(errType, type) {
            if (!!errType || !type) {
                res.status(400).json({message: "Type could not be updated." });
            } else {
                res.status(200).json({message: "Type has successfuly been updated." });
            }
        });
    }
}

const _delete = (req, res, next) => {
        
    const user = req.user;
    const {typeId} = req.params;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to delete params."})
    } else if (!typeId) {
        res.status(400).json({message: "Type ID is missing."});
    } else {
        require("../models/Type").findByIdAndDelete(typeId, function(errType, type) {
            if (!!errType || !type) {
                res.status(400).json({message: "Type could not be deleted." });
            } else {
                res.status(200).json({message: "Type has successfuly been deleted." });
            }
        });
    }
}

const typeController = {
    getAll,
    getById,
    getDrop,
    create,
    update,
    _delete
};

module.exports = typeController;