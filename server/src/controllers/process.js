const getById = (req, res, next) => {

    const {processId} = req.params;

    require("../models/Process").findById(processId, function (err, user) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!user) {
            res.status(400).json({ message: "Could not retrieve process information." });
        } else {
            res.json({user: user});
        }
    });
}


const getAll = (req, res, next) => {
    
    const { dropdown, sort } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    matchDropdown(dropdown.user, dropdown.processType, dropdown.createdAt).then(myMatch => {
        require("../models/Process").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/process")(myMatch, format),
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "createdAt"]: sort.isAscending === false ? -1 : 1,
                                "_id": 1
                            }
                        },
                        { "$limit": pageSize + ((nextPage - 1) * pageSize) },
                        { "$skip": ((nextPage - 1) * pageSize) }
                        
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/process")(myMatch, format),
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
    matchDropdown(dropdown.user, dropdown.processType, dropdown.createdAt).then(myMatch => {
        switch(key) {
            case "user":
            case "processType":
                require("../models/Process").aggregate([
                    ...require("../pipelines/first_stage/process")(myMatch, format),
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$addToSet": `$${key}`}
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    } 
                });
                break;
            case "createdAt":
                require("../models/Process").aggregate([
                    ...require("../pipelines/first_stage/process")(myMatch, format),
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$addToSet": `$${key}X`}
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
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
        resolve(["user", "processType", "createdAt" ].reduce(function(acc, cur, index) {
            if (!!myArgs[index]) {
                if (cur ==="createdAt") {
                    acc[`${cur}X`] = myArgs[index];
                } else {
                    acc[`${cur}`] = myArgs[index];
                }
            }
            return acc;
        },{}));
    });
}

const processController = {
    getAll,
    getDrop,
    getById
};

module.exports = processController;