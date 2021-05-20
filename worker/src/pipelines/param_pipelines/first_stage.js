module.exports = (myMatch) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$project": {
                "opco": 1,
                "artNr": 1,
                "description": 1,
                "qty": 1,
                "steelType": { "$ifNull": [ "$parameters.grade.steelType", "" ] },
                "pffType": { "$ifNull": [ "$parameters.type.pffType", "" ] },
                "sizeOne": { "$ifNull": [ "$parameters.sizeOne.name", "" ] },
                "sizeTwo": { "$ifNull": [ "$parameters.sizeTwo.name", "" ] },
                "sizeThree": { "$ifNull": [ "$parameters.sizeThree.name", "" ] },
                "wallOne": { "$ifNull": [ "$parameters.wallOne.name", "" ] },
                "wallTwo": { "$ifNull": [ "$parameters.wallTwo.name", "" ] },
                "type": { "$ifNull": [ "$parameters.type.name", "" ] },
                "grade": { "$ifNull": [ "$parameters.grade.name", "" ] },
                "length": { "$ifNull": [ "$parameters.length.name", "" ] },
                "end": { "$ifNull": [ "$parameters.end.name", "" ] },
                "surface": { "$ifNull": [ "$parameters.surface.name", "" ] },
            }
        }
        // {
        //     "$project": {
        //         "artNr": 1,
        //         "description": 1,
        //         "qty": 1,
        //         "parameters": {
        //             "steelType": { "$ifNull": [ "$parameters.grade.steelType", "" ] },
        //             "pffType": { "$ifNull": [ "$parameters.type.pffType", "" ] },
        //             "sizeOne": { "$ifNull": [ "$parameters.sizeOne.name", "" ] },
        //             "sizeTwo": { "$ifNull": [ "$parameters.sizeTwo.name", "" ] },
        //             "sizeThree": { "$ifNull": [ "$parameters.sizeThree.name", "" ] },
        //             "wallOne": { "$ifNull": [ "$parameters.wallOne.name", "" ] },
        //             "wallTwo": { "$ifNull": [ "$parameters.wallTwo.name", "" ] },
        //             "type": { "$ifNull": [ "$parameters.type.name", "" ] },
        //             "grade": { "$ifNull": [ "$parameters.grade.name", "" ] },
        //             "length": { "$ifNull": [ "$parameters.length.name", "" ] },
        //             "end": { "$ifNull": [ "$parameters.end.name", "" ] },
        //             "surface": { "$ifNull": [ "$parameters.surface.name", "" ] },
        //         }
        //     }
        // },
        // {
        //     "$sort": {
        //         "artNr": 1,
        //         "qty": -1
        //     }
        // },
        // {
        //     "$group": {
        //       "_id": "$artNr",
        //       "description": { "$first": "$description" },
        //       "steelType": { "$first": "$parameters.steelType" },
        //       "pffType": { "$first": "$parameters.pffType" },
        //       "sizeOne": { "$first": "$parameters.sizeOne" },
        //       "sizeTwo": { "$first": "$parameters.sizeTwo" },
        //       "sizeThree": { "$first": "$parameters.sizeThree" },
        //       "wallOne": { "$first": "$parameters.wallOne" },
        //       "wallTwo": { "$first": "$parameters.wallTwo" },
        //       "type": { "$first": "$parameters.type" },
        //       "grade": { "$first": "$parameters.grade" },
        //       "length": { "$first": "$parameters.length" },
        //       "end": { "$first": "$parameters.end" },
        //       "surface": { "$first": "$parameters.surface" },
        //     }
        // },
    ]
}