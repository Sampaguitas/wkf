const getById = (req, res, next) => {

    const {pffId} = req.params;

    require("../models/Pff").findById(pffId, function (err, doc) {
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
    matchDropdown(dropdown.name).then(myMatch => {
        require("../models/Pff").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/pff")(myMatch, format),
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
                        ...require("../pipelines/first_stage/pff")(myMatch, format),
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
    matchDropdown(dropdown.name).then(myMatch => {
        switch(key) {
            case "name":
                require("../models/Pff").aggregate([
                    ...require("../pipelines/first_stage/pff")(myMatch, format),
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
            default: res.status(200).json([]);
        }
    }); 
}

function matchDropdown() {
    let myArgs = arguments;

    return new Promise(function(resolve) {
        resolve(["name"].reduce(function(acc, cur, index) {
            if (myArgs[index] !== "") {
                acc[`${cur}`] = myArgs[index];
            }
            return acc;
        },{}));
    });
}

const pffController = {
    getAll,
    getById,
    getDrop
};

module.exports = pffController;