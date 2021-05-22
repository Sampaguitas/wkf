module.exports = (nextPage, pageSize) => {
    return {
        "data": 1,
        "suppliers": 1,
        "paginate": {
            "currentPage": { "$first": "$pagination.nextPage" },
            "firstItem": {
                "$cond": {
                    "if": { "$ne": [{ "$size": "$data" }, 0] },
                    "then": ((nextPage - 1) * pageSize) + 1,
                    "else": 0
                }
            },
            "lastItem": {
                "$cond": {
                    "if": { "$ne": [{ "$size": "$data" }, 0] },
                    "then": {"$subtract": [{ "$add": [((nextPage - 1) * pageSize) + 1, { "$size": "$data" }] }, 1]},
                    "else": 0
                }
            },
            "pageItems": { "$size": "$data" },
            "pageLast": { "$ifNull": [{ "$ceil": { "$divide": [ { "$first": "$pagination.totalItems" }, { "$first": "$pagination.pageSize" } ] } }, 1 ] },
            "totalItems": { "$first": "$pagination.totalItems" },
            "first": {
                "$cond": {
                    //if: nextPage < 4
                    "if": {
                        "$lt": [{ "$first": "$pagination.nextPage" }, 4]
                    },
                    "then": 1,
                    "else": {
                        "$cond": {
                            //if: nextPage === pageLast
                            "if": {
                                "$eq": [
                                    { "$first": "$pagination.nextPage" }, 
                                    { "$ifNull": [{ "$ceil": { "$divide": [ { "$first": "$pagination.totalItems" }, { "$first": "$pagination.pageSize" } ] } }, 1 ] },
                                ]
                            },
                            // then: nextPage - 2
                            "then": { "$subtract": [ { "$first": "$pagination.nextPage" }, 2 ] },
                            // else: nextPage - 2
                            "else": { "$subtract": [ { "$first": "$pagination.nextPage" }, 1 ] },
                        }
                    }
                }
            },
            "second": {
                "$cond": {
                    //if: nextPage < 4
                    "if": {
                        "$lt": [{ "$first": "$pagination.nextPage" }, 4]
                    },
                    "then": 2,
                    "else": {
                        "$cond": {
                            //if: nextPage === pageLast
                            "if": {
                                "$eq": [
                                    { "$first": "$pagination.nextPage" }, 
                                    { "$ifNull": [{ "$ceil": { "$divide": [ { "$first": "$pagination.totalItems" }, { "$first": "$pagination.pageSize" } ] } }, 1 ] },
                                ]
                            },
                            // then: nextPage - 1
                            "then": { "$subtract": [ { "$first": "$pagination.nextPage" }, 1 ] },
                            // else: nextPage
                            "else": { "$first": "$pagination.nextPage" },
                        }
                    }
                }
            },
            "third": {
                "$cond": {
                    //if: nextPage < 4
                    "if": {
                        "$lt": [{ "$first": "$pagination.nextPage" }, 4]
                    },
                    "then": 3,
                    "else": {
                        "$cond": {
                            //if: nextPage === pageLast
                            "if": {
                                "$eq": [
                                    { "$first": "$pagination.nextPage" }, 
                                    { "$ifNull": [{ "$ceil": { "$divide": [ { "$first": "$pagination.totalItems" }, { "$first": "$pagination.pageSize" } ] } }, 1 ] },
                                ]
                            },
                            // then: nextPage
                            "then": { "$first": "$pagination.nextPage" },
                            // else: nextPage + 1
                            "else": { "$add": [ { "$first": "$pagination.nextPage" }, 1 ] },
                        }
                    }
                }
            },
        } 
    }
}