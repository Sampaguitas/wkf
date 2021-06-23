const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getById = (req, res, next) => {

    const {sizeId} = req.params;

    require("../models/Size").findById(sizeId, function (err, doc) {
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
    matchDropdown(dropdown.lunar, dropdown.nps, dropdown.dn, dropdown.mm, dropdown.inch, dropdown.tags, dropdown.pffTypes, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        require("../models/Size").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/size")(myMatch, format),
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "mm"]: sort.isAscending === false ? -1 : 1,
                                "mm": 1,
                                "nps": 1,
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
                                "nps": 1,
                                "dn": 1,
                                "mm":  { "$concat": ["$mmX", " mm"] },
                                "inch":  { "$concat": ["$inchX", " in"] },
                                "createdBy": "$createdBy.name",
                                "updatedBy": "$updatedBy.name",
                                "createdAt": 1,
                                "updatedAt": 1,
                            }
                        }
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/size")(myMatch, format),
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
    matchDropdown(dropdown.lunar, dropdown.nps, dropdown.dn, dropdown.mm, dropdown.inch, dropdown.tags, dropdown.pffTypes, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        switch(key) {
            case "size_pffTypes":
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
            case "nps":
            case "dn":
            case "lunar":
                require("../models/Size").aggregate([
                    ...require("../pipelines/first_stage/size")(myMatch, format),
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
            case "mm":
            case "inch":
                require("../models/Size").aggregate([
                    ...require("../pipelines/first_stage/size")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}X`,
                            "name": { "$first": { "$concat": [ `$$ROOT.${key}X`, `${key === inch ? " in" : " mm"}` ] } },
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
                require("../models/Size").aggregate([
                    ...require("../pipelines/first_stage/size")(myMatch, format),
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
            case "createdBy":
            case "updatedBy":
                require("../models/Size").aggregate([
                    ...require("../pipelines/first_stage/size")(myMatch, format),
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
                require("../models/Size").aggregate([
                    ...require("../pipelines/first_stage/size")(myMatch, format),
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
        resolve(["lunar", "nps", "dn", "mm", "inch", "tags", "pffTypes", "createdBy", "createdAt", "updatedBy", "updatedAt"].reduce(function(acc, cur, index) {
            if (myArgs[index] !== "") {
                if (["createdBy", "updatedBy"].includes(cur)) {
                    acc[`${cur}`] = ObjectId(myArgs[index]);
                } else if (["mm", "inch"].includes(cur)) {
                    acc[`${cur}X`] = myArgs[index];
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
    const { lunar, nps, dn, mm, inch, tags, pffTypes } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to create params"});
    } else if ((!nps && !dn) || !pffTypes || pffTypes.length < 1 || !lunar) {
        res.status(400).json({message: "Name, PFF Types and lunar cannot be emty."});
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 2) {
        res.status(400).json({message: "Wrong lunar format."});
    } else if (!!mm && !/^[0-9]{1,}(.[0-9]{1})?$/.test(mm)) {
        res.status(400).json({message: "Wrong mm format."});
    } else if (!!inch && !/^[0-9]{1,}(.[0-9]{1})?$/.test(inch)) {
        res.status(400).json({message: "Wrong in format."});
    } else {
        
        if (!tags.includes(nps)) tags.push(nps);
        if (!tags.includes(dn)) tags.push(dn);

        let newSize = new require("../models/Size")({
            "lunar": lunar.toUpperCase(),
            "nps": nps,
            "dn": dn,
            "mm": mm,
            "inch": inch,
            "tags": tags,
            "pffTypes": pffTypes,
            "createdBy": user._id,
            "updatedBy": user._id
        });

        newSize
        .save()
        .then( () => res.status(200).json({message: "Size has successfuly been created." }))
        .catch( () => res.status(400).json({message: "Size could not be created." }));
    }
}


const update = (req, res, next) => {

    const user = req.user;
    const {sizeId} = req.params;
    const { lunar, nps, dn, mm, inch, tags, pffTypes } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to update params."});
    } else if (!sizeId) {
        res.status(400).json({message: "Size ID is missing."});
    } else if ((!nps && !dn) || !pffTypes || pffTypes.length < 1 || !lunar) {
        res.status(400).json({message: "Size, PFF Types and lunar cannot be emty."});
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 2) {
        res.status(400).json({message: "Wrong lunar format."});
    } else if (!!mm && !/^[0-9]{1,}(.[0-9]{1})?$/.test(mm)) {
        res.status(400).json({message: "Wrong mm format."});
    } else if (!!inch && !/^[0-9]{1,}(.[0-9]{1})?$/.test(inch)) {
        res.status(400).json({message: "Wrong in format."});
    } else {

        if (!tags.includes(nps)) tags.push(nps);
        if (!tags.includes(dn)) tags.push(dn);
        
        let update = {
            "lunar": lunar.toUpperCase(),
            "nps": nps,
            "dn": dn,
            "mm": mm,
            "inch": inch,
            "tags": tags,
            "pffTypes": pffTypes,
            "updatedBy": user._id
        };
        let options = { "new": true };
        require("../models/Size").findByIdAndUpdate(sizeId, update, options, function(errSize, size) {
            if (!!errSize || !size) {
                res.status(400).json({message: "Size could not be updated." });
            } else {
                res.status(200).json({message: "Size has successfuly been updated." });
            }
        });
    }
}

const _delete = (req, res, next) => {
        
    const user = req.user;
    const {sizeId} = req.params;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to delete params."})
    } else if (!sizeId) {
        res.status(400).json({message: "Size ID is missing."});
    } else {
        require("../models/Size").findByIdAndDelete(sizeId, function(errSize, size) {
            if (!!errSize || !size) {
                res.status(400).json({message: "Size could not be deleted." });
            } else {
                res.status(200).json({message: "Size has successfuly been deleted." });
            }
        });
    }
}

const sizeController = {
    getAll,
    getById,
    getDrop,
    create,
    update,
    _delete
};

module.exports = sizeController;