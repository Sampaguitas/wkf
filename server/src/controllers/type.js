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
    matchDropdown(dropdown.lunar, dropdown.name, dropdown.tag, dropdown.pfftype, dropdown.isComplete, dropdown.isMultiple).then(myMatch => {
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
    matchDropdown(dropdown.lunar, dropdown.name, dropdown.tag, dropdown.pfftype, dropdown.isComplete, dropdown.isMultiple).then(myMatch => {
        switch(key) {
            case "lunar":
            case "name":
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
            case "tag":
            case "pffType":
                require("../models/Type").aggregate([
                    ...require("../pipelines/first_stage/type")(myMatch, format),
                    {
                        "$unwind": `$${key}s`
                    },
                    {
                        "$group": {
                            "_id": `$${key}s`,
                            "name": {"$first":`$$ROOT.${key}s`},
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
                let found = [ { "_id": true, "name": "true"}, { "_id": false, "name": "false"} ].filter(e => {
                    let myRegex = new RegExp(escape(name));
                    return !!name ? myRegex.test(e.name) : true;
                });
                if (found === undefined) {
                    res.status(200).json([])
                } else {
                    res.status(200).json(found)
                }
                break;
            default: res.status(200).json([]);
        }
    });
}

function matchDropdown() {
    let myArgs = arguments;

    return new Promise(function(resolve) {
        resolve(["lunar", "name", "tag", "pfftype", "isComplete", "isMultiple"].reduce(function(acc, cur, index) {
            if (myArgs[index] !== "") {
                if (cur === "tag") {
                    acc[`${cur}s`] = myArgs[index];
                } else {
                    acc[`${cur}`] = myArgs[index];
                }
            }
            return acc;
        },{}));
    });
}

const typeController = {
    getAll,
    getById,
    getDrop
};

module.exports = typeController;