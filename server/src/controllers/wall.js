const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getById = (req, res, next) => {

    const {wallId} = req.params;

    require("../models/Wall").findById(wallId, {
        "sizeId": { "$toString": "$sizeId" },
        "mm": { "$toString": "$mm" },
        "inch": { "$toString": "$inch" },
        "idt": "$idt",
        "sch": "$sch",
        "schS": "$schS",
        "lunar": "$lunar",
        "tags": "$tags",
        "pffTypes": "$pffTypes",
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
    matchDropdown(dropdown.sizeId, dropdown.lunar, dropdown.mm, dropdown.inch, dropdown.idt, dropdown.sch, dropdown.schS, dropdown.tags, dropdown.pffTypes, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        require("../models/Wall").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/wall")(myMatch, format),
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "size"]: sort.isAscending === false ? -1 : 1,
                                "sizeId": 1,
                                "mm": 1,
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
                                "sizeId": { "$concat": ["$sizeIdX", " mm"] },
                                "mm":  { "$concat": ["$mmX", " mm"] },
                                "inch":  { "$concat": ["$inchX", " in"] },
                                "idt":  1,
                                "sch":  1,
                                "schS":  1,
                                "createdBy": "$createdBy.name",
                                "updatedBy": "$updatedBy.name",
                                "createdAt": 1,
                                "updatedAt": 1,
                            }
                        }
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
    matchDropdown(dropdown.sizeId, dropdown.lunar, dropdown.mm, dropdown.inch, dropdown.idt, dropdown.sch, dropdown.schS, dropdown.tags, dropdown.pffTypes, dropdown.createdBy, dropdown.createdAt, dropdown.updatedBy, dropdown.updatedAt).then(myMatch => {
        switch(key) {
            case "wall_pffTypes":
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
            case "wall_sizeId":
                require("../models/Size").aggregate([
                    {
                        "$match": {
                            "mm": { "$ne": null }
                        }
                    },
                    {
                        "$addFields": {
                            "mm": { "$toString": "$mm" },
                        },
                    },
                    {
                        "$group": {
                            "_id": `$mm`,
                            "name": {"$first": { "$concat": [`$$ROOT.mm`, " mm"] } },
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
            case "wall_idt":
                require("../models/Idt").aggregate([
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
                break
            case "wall_sch":
                require("../models/Sch").aggregate([
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
                break
            case "wall_schS":
                require("../models/Schs").aggregate([
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
                break
            case "sizeId":
                require("../models/Wall").aggregate([
                    ...require("../pipelines/first_stage/wall")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}X`,
                            "name": { "$first": { "$concat": [`$$ROOT.${key}X`, " mm" ] } },
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
            case "mm":
                require("../models/Wall").aggregate([
                    ...require("../pipelines/first_stage/wall")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}X`,
                            "name": { "$first": { "$concat": [ `$$ROOT.${key}X`, ` mm` ] } },
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
            case "inch":
                require("../models/Wall").aggregate([
                    ...require("../pipelines/first_stage/wall")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}X`,
                            "name": { "$first": { "$concat": [ `$$ROOT.${key}X`, ` in` ] } },
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
            case "idt":
            case "sch":
            case "schS":
                require("../models/Wall").aggregate([
                    ...require("../pipelines/first_stage/wall")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": { "$first": `$$ROOT.${key}` },
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
            case "createdBy":
            case "updatedBy":
                require("../models/Wall").aggregate([
                    ...require("../pipelines/first_stage/wall")(myMatch, format),
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
                require("../models/Wall").aggregate([
                    ...require("../pipelines/first_stage/wall")(myMatch, format),
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
        resolve(["sizeId", "lunar", "mm", "inch", "idt", "sch", "schS", "tags", "pffTypes", "createdBy", "createdAt", "updatedBy", "updatedAt"].reduce(function(acc, cur, index) {
            if (myArgs[index] !== "") {
                if (["createdBy", "updatedBy"].includes(cur)) {
                    acc[`${cur}`] = ObjectId(myArgs[index]);
                } else if (["sizeId", "mm", "inch"].includes(cur)) {
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
    const { lunar, sizeId, mm, inch, idt, sch, schS, tags, pffTypes } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to create params"});
    } else if (!sizeId || !pffTypes || pffTypes.length < 1 || !lunar) {
        res.status(400).json({message: "SizeId, PFF Types and lunar cannot be emty."});
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 2) {
        res.status(400).json({message: "Wrong lunar format."});
    } else if (!/^[0-9]{1,}(.[0-9]{1})?$/.test(sizeId)) {
        res.status(400).json({message: "Wrong sizeId format."});
    } else if (!!mm && !/^[0-9]{1,}(.[0-9]{1,2})?$/.test(mm)) {
        res.status(400).json({message: "Wrong mm format."});
    } else if (!!inch && !/^[0-9]{1,}(.[0-9]{1,3})?$/.test(inch)) {
        res.status(400).json({message: "Wrong in format."});
    } else if (!!idt && !["STD", "XS", "XXS"].includes(idt)) {
        res.status(400).json({message: "Wrong idt format."});
    } else if (!!sch && !["S5", "S10", "S20", "S30", "S40", "S60", "S80", "S100", "S120", "S140", "S160"].includes(sch)) {
        res.status(400).json({message: "Wrong sch format."});
    } else if (!!schS && !["S5S", "S10S", "S40S", "S80S"].includes(schS)) {
        res.status(400).json({message: "Wrong schS format."});
    } else {
        
        if (!!mm && !tags.includes(`${mm} mm`)) tags.push(`${mm} mm`);
        if (!!inch && !tags.includes(`${inch} in`)) tags.push(`${inch} in`);
        if (!!idt && !tags.includes(idt)) tags.push(idt);
        if (!!sch && !tags.includes(sch)) tags.push(sch);
        if (!!schS && !tags.includes(schS)) tags.push(schS);

        let newWall = new require("../models/Wall")({
            "lunar": lunar.toUpperCase(),
            "sizeId": sizeId,
            "mm": mm,
            "inch": inch,
            "idt": idt,
            "sch": sch,
            "schS": schS,
            "tags": tags,
            "pffTypes": pffTypes,
            "createdBy": user._id,
            "updatedBy": user._id
        });

        newWall
        .save()
        .then( () => res.status(200).json({message: "Wall has successfuly been created." }))
        .catch( () => res.status(400).json({message: "Wall could not be created." }));
    }
}


const update = (req, res, next) => {

    const user = req.user;
    const {wallId} = req.params;
    const { lunar, sizeId, mm, inch, idt, sch, schS, tags, pffTypes } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to create params"});
    } else if (!wallId) {
        res.status(400).json({message: "Wall ID is missing."});
    } else if (!sizeId || !pffTypes || pffTypes.length < 1 || !lunar) {
        res.status(400).json({message: "SizeId, PFF Types and lunar cannot be emty."});
    } else if (!/^[0-9a-fA-F]+$/.test(lunar) || lunar.length !== 2) {
        res.status(400).json({message: "Wrong lunar format."});
    } else if (!/^[0-9]{1,}(.[0-9]{1})?$/.test(sizeId)) {
        res.status(400).json({message: "Wrong sizeId format."});
    } else if (!!mm && !/^[0-9]{1,}(.[0-9]{1,2})?$/.test(mm)) {
        res.status(400).json({message: "Wrong mm format."});
    } else if (!!inch && !/^[0-9]{1,}(.[0-9]{1,3})?$/.test(inch)) {
        res.status(400).json({message: "Wrong in format."});
    } else if (!!idt && !["STD", "XS", "XXS"].includes(idt)) {
        res.status(400).json({message: "Wrong idt format."});
    } else if (!!sch && !["S5", "S10", "S20", "S30", "S40", "S60", "S80", "S100", "S120", "S140", "S160"].includes(sch)) {
        res.status(400).json({message: "Wrong sch format."});
    } else if (!!schS && !["S5S", "S10S", "S40S", "S80S"].includes(schS)) {
        res.status(400).json({message: "Wrong schS format."});
    } else {

        if (!!mm && !tags.includes(`${mm} mm`)) tags.push(`${mm} mm`);
        if (!!inch && !tags.includes(`${inch} in`)) tags.push(`${inch} in`);
        if (!!idt && !tags.includes(idt)) tags.push(idt);
        if (!!sch && !tags.includes(sch)) tags.push(sch);
        if (!!schS && !tags.includes(schS)) tags.push(schS);
        
        let update = {
            "lunar": lunar.toUpperCase(),
            "sizeId": sizeId,
            "mm": mm,
            "inch": inch,
            "idt": idt,
            "sch": sch,
            "schS": schS,
            "tags": tags,
            "pffTypes": pffTypes,
            "updatedBy": user._id
        };
        let options = { "new": true };
        require("../models/Wall").findByIdAndUpdate(wallId, update, options, function(errWall, wall) {
            if (!!errWall || !wall) {
                res.status(400).json({message: "Wall could not be updated." });
            } else {
                res.status(200).json({message: "Wall has successfuly been updated." });
            }
        });
    }
}

const _delete = (req, res, next) => {
        
    const user = req.user;
    const {wallId} = req.params;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to delete params."})
    } else if (!wallId) {
        res.status(400).json({message: "Wall ID is missing."});
    } else {
        require("../models/Wall").findByIdAndDelete(wallId, function(errWall, wall) {
            if (!!errWall || !wall) {
                res.status(400).json({message: "Wall could not be deleted." });
            } else {
                res.status(200).json({message: "Wall has successfuly been deleted." });
            }
        });
    }
}



const wallController = {
    getAll,
    getById,
    getDrop,
    create,
    update,
    _delete
};

module.exports = wallController;