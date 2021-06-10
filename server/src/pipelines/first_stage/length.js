module.exports = (myMatch, format) => {
    return [
        {
            "$addFields": {
                "createdAt": { "$dateToString": { format, "date": "$createdAt"} },
                "updatedAt": { "$dateToString": { format, "date": "$updatedAt"} },
                "unitIndex": {
                    "$switch": {
                        "branches": [
                            { "case": { "$regexMatch": { "input": "$name", "regex": /^(SRL|DRL)$/ } }, "then": 0 },
                            { "case": { "$regexMatch": { "input": "$name", "regex": /^(\d|\.)* mm$/ } }, "then": 1 },
                            { "case": { "$regexMatch": { "input": "$name", "regex": /^(\d| |\/)*"$/ } }, "then": 2 },
                            
                        ],
                        "default": 3
                    }
                }
            }
        },
        {
            "$match": myMatch
        }
    ];
}