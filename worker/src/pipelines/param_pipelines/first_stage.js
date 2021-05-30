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
    ]
}