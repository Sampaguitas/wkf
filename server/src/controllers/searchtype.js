const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getById = (req, res, next) => {

    const {searchtypeId} = req.params;

    require("../models/Searchtype").findById(searchtypeId, {
        "lunar": "$value.lunar",
        "name": "$value.name",
        "pffType": "$value.pffType",
        "tags": "$value.tags",
        "types": "$types",
        "minSize": { "$toString": "$minSize" },
        "maxSize": { "$toString": "$maxSize" },
    }, function (err, doc) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!doc) {
            res.status(400).json({ message: "Could not retrieve export information." });
        } else {
            res.json({doc});
        }
    });
}

const getAll = (req, res, next) => {
    
    const { dropdown, sort } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    matchDropdown(dropdown.lunar, dropdown.name, dropdown.tags, dropdown.pffType, dropdown.types, dropdown.minSize, dropdown.maxSize, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        require("../models/Searchtype").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/searchtype")(myMatch, format),
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
                                "name": "$value.name",
                                "pffType": "$value.pffType",
                                "minSize": 1,
                                "maxSize": 1,
                                "createdBy": "$createdBy.name",
                                "updatedBy": "$updatedBy.name",
                                "createdAt": 1,
                                "updatedAt": 1,
                            }
                        }
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/searchtype")(myMatch, format),
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

    matchDropdown(dropdown.lunar, dropdown.name, dropdown.tags, dropdown.pffType, dropdown.types, dropdown.minSize, dropdown.maxSize, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        
        switch(key) {
            case "searchtype_lunar":
                require("../models/Type").aggregate([
                    {
                        "$group": {
                            "_id": `$lunar`,
                            "name": {"$first":`$$ROOT.lunar`},
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
            case "searchtype_name":
                require("../models/Type").aggregate([
                    {
                        "$match": {
                            "isMultiple": true
                        }
                    },
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
            case "searchtype_tags":
            case "searchtype_types":
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
            case "searchtype_pffType":
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
            case "searchtype_minSize":
            case "searchtype_maxSize":
                require("../models/Size").aggregate([
                    {
                        "$match": {
                            "mm": { "$exists": true},
                            
                        }
                    },
                    {
                        "$project": {
                            "mm": { "$toString": "$mm" }
                        }
                    },
                    {
                        "$group": {
                            "_id":  "$mm",
                            "name": { "$first": "$$ROOT.mm" },
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
            case "lunar":
            case "name":
            case "pffType":
                require("../models/Searchtype").aggregate([
                    ...require("../pipelines/first_stage/searchtype")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$value.${key}`,
                            "name": {"$first":`$$ROOT.value.${key}`},
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
                require("../models/Searchtype").aggregate([
                    ...require("../pipelines/first_stage/type")(myMatch, format),
                    {
                        "$unwind": `$value.${key}`
                    },
                    {
                        "$group": {
                            "_id": `$value.${key}`,
                            "name": {"$first":`$$ROOT.value.${key}`},
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
            case "minSize":
            case "maxSize":
                require("../models/Searchtype").aggregate([
                    ...require("../pipelines/first_stage/type")(myMatch, format),
                    {
                        "$unwind": `$${key}`
                    },
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": { "$first": `$$ROOT.${key}` },
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
                require("../models/Searchtype").aggregate([
                    ...require("../pipelines/first_stage/searchtype")(myMatch, format),
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
                require("../models/Searchtype").aggregate([
                    ...require("../pipelines/first_stage/searchtype")(myMatch, format),
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
        resolve(["lunar", "name", "tags", "pffType", "types", "minSize", "maxSize", "createdBy", "createdAt", "updatedBy", "updatedAt"].reduce(function(acc, cur, index) {
            if (myArgs[index] !== "") {
                if (["createdBy", "updatedBy"].includes(cur)) {
                    acc[`${cur}`] = ObjectId(myArgs[index]);
                } else if (["lunar", "name", "tags", "pffType"].includes(cur)) {
                    acc[`value.${cur}`] = myArgs[index];
                } else if (["minSize", "maxSize"].includes(cur)) {
                    acc[`${cur}`] = myArgs[index];
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
    const { lunar, name, tags, pffType, types, minSize, maxSize } = req.body;
    
    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to create params"})
    } else if (!lunar || !name || !pffType || !minSize || !maxSize || !types || types.length < 1) {
        res.status(400).json({message: "Name, PFF Type and lunar minSize and maxSize cannot be emty."})
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 3) {
        res.status(400).json({message: "Wrong lunar format."})
    } else {
        
        if (!tags.includes(name)) tags.push(name);
        types.map(type => !tags.include(type) && tags.push(type));

        let newSearchtype = new require("../models/Searchtype")({
            "value": {
                "lunar": lunar.toUpperCase(),
                "name": name,
                "tags": tags,
                "pffType": pffType,
            },
            "minSize": minSize,
            "maxSize": maxSize,
            "createdBy": user._id,
            "updatedBy": user._id
        });

        newSearchtype
        .save()
        .then( () => res.status(200).json({message: "Search Type has successfuly been created." }))
        .catch( () => res.status(400).json({message: "Search Type could not be created." }));
    }
}


const update = (req, res, next) => {
        
    const user = req.user;
    const {searchtypeId} = req.params;
    const { name, pffType, isComplete, isMultiple, lunar, tags } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to update params."})
    } else if (!searchtypeId) {
        res.status(400).json({message: "Type ID is missing."});
    } else if (!lunar || !name || !pffType || !minSize || !maxSize || !types || types.length < 1) {
        res.status(400).json({message: "Name, PFF Type and lunar minSize and maxSize cannot be emty."});
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 3) {
        res.status(400).json({message: "Wrong lunar format."})
    } else {

        if (!tags.includes(name)) tags.push(name);
        types.map(type => !tags.include(type) && tags.push(type));
        
        let update = {
            "value": {
                "lunar": lunar.toUpperCase(),
                "name": name,
                "tags": tags,
                "pffType": pffType,
            },
            "minSize": minSize,
            "maxSize": maxSize,
            "updatedBy": user._id
        };
        
        let options = { "new": true };

        require("../models/Searchtype").findByIdAndUpdate(searchtypeId, update, options, function(errType, type) {
            if (!!errType || !type) {
                res.status(400).json({message: "Search Type could not be updated." });
            } else {
                res.status(200).json({message: "Search Type has successfuly been updated." });
            }
        });
    }
}

const _delete = (req, res, next) => {
        
    const user = req.user;
    const {searchtypeId} = req.params;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to delete params."})
    } else if (!searchtypeId) {
        res.status(400).json({message: "Type ID is missing."});
    } else {
        require("../models/Searchtype").findByIdAndDelete(searchtypeId, function(errType, type) {
            if (!!errType || !type) {
                res.status(400).json({message: "Search Type could not be deleted." });
            } else {
                res.status(200).json({message: "Search Type has successfuly been deleted." });
            }
        });
    }
}

const searchtypeController = {
    getAll,
    getById,
    getDrop,
    create,
    update,
    _delete
};

module.exports = searchtypeController;