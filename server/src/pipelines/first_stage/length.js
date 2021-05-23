module.exports = (myMatch, format) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$addFields": {
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
            "$project": {
                "createdAt": 0,
                "updatedAt": 0
            }
        },
    ];
}