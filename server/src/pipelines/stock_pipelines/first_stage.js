module.exports = (myMatch, system, filter) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$project": {
                "_id": 1,
                "opco": 1,
                "artNr": 1,
                "description": 1,
                "qty": 1,
                // "qty": {
                //     "$cond": [ 
                //         { "$eq": [system, "IMPERIAL"] },
                //         {
                //             "$switch": {
                //                 "branches": [
                //                     { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$qty", 2.204623 ] } },
                //                     { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$qty", 3.28084 ] } }
                //                 ],
                //                 default: "$qty"
                //             }
                //         },
                //         "$qty"
                //     ]
                // },
                "firstInStock": "$purchase.firstInStock",
                // "firstInStock": {
                //     "$cond": [
                //         { "$eq": [system, "IMPERIAL" ] },
                //         {
                //             "$switch": {
                //                 "branches": [
                //                     { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$purchase.firstInStock", 2.204623 ] } },
                //                     { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$purchase.firstInStock", 3.28084 ] } }
                //                 ],
                //                 "default": "$purchase.firstInStock"
                //             }
                //         },
                //         "$purchase.firstInStock"
                //     ],
                // },
                "uom": 1,
                // "uom": {
                //     "$cond": [
                //         { "$eq": [system, "IMPERIAL" ] },
                //         {
                //             "$switch": {
                //                 "branches": [
                //                     { "case": { "$eq": [ "$uom", "KG" ] }, "then": "LB" },
                //                     { "case": { "$eq": [ "$uom", "LB" ] }, "then": "LB" },
                //                     { "case": { "$eq": [ "$uom", "M" ] }, "then": "FT" },
                //                     { "case": { "$eq": [ "$uom", "FT" ] }, "then": "FT" },
                //                 ],
                //                 default: "ST"
                //             }
                //         },
                //         "$uom"
                //     ],
                // },
                "gip": "$price.gip",
                // "gip": {
                //     "$cond": [
                //         { "$eq": [ system, "IMPERIAL" ] },
                //         {
                //             "$switch": {
                //                 "branches": [
                //                     { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$price.gip", 2.204623 ] } },
                //                     { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$price.gip", 3.28084 ] } }
                //                 ],
                //                 default: "$price.gip"
                //             }
                //         },
                //         "$price.gip"
                //     ],
                // },
                "rv": "$price.rv",
                // "rv": {
                //     "$cond": [
                //         { "$eq": [ system, "IMPERIAL" ] },
                //         {
                //             "$switch": {
                //                 "branches": [
                //                     { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$price.rv", 2.204623 ] } },
                //                     { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$price.rv", 3.28084 ] } }
                //                 ],
                //                 default: "$price.rv"
                //             }
                //         },
                //         "$price.rv"
                //     ],
                // },
                "currency": "EUR",
                "parameters": 1
                // "parameters": {
                //     "steelType": { "$ifNull": [ "$parameters.grade.steelType", "" ] },
                //     "pffType": { "$ifNull": [ "$parameters.type.pffType", "" ] },
                //     "sizeOne": { "$ifNull": [ "$parameters.sizeOne.name", "" ] },
                //     "sizeTwo": { "$ifNull": [ "$parameters.sizeTwo.name", "" ] },
                //     "sizeThree": { "$ifNull": [ "$parameters.sizeThree.name", "" ] },
                //     "wallOne": { "$ifNull": [ "$parameters.wallOne.name", "" ] },
                //     "wallTwo": { "$ifNull": [ "$parameters.wallTwo.name", "" ] },
                //     "type": { "$ifNull": [ "$parameters.type.name", "" ] },
                //     "grade": { "$ifNull": [ "$parameters.grade.name", "" ] },
                //     "length": { "$ifNull": [ "$parameters.length.name", "" ] },
                //     "end": { "$ifNull": [ "$parameters.end.name", "" ] },
                //     "surface": { "$ifNull": [ "$parameters.surface.name", "" ] },
                // }
            },


        },
        // {
        //     "$addFields": {
        //         "qtyX": { "$toString": "$qty" },
        //         "firstInStockX": { "$toString": "$firstInStock" },
        //         "gipX": { "$toString": "$gip" },
        //         "rvX": { "$toString": "$rv" },
        //     }
        // },
        // {
        //     "$match": matchFilter(filter.opco, filter.artNr, filter.description, filter.qty, filter.firstInStock, filter.uom, filter.gip, filter.rv, filter.currency)
        // },
        // {
        //     "$project": {
        //         "qtyX": 0,
        //         "firstInStockX": 0,
        //         "gipX": 0,
        //         "rvX": 0,
        //     }
        // },
    ]
}

function matchFilter() {
    let myArgs = arguments;
    return(["opco", "artNr", "description", "qty", "firstInStock", "uom", "gip", "rv", "currency"].reduce(function(acc, cur, index) {
        if (!!myArgs[index]) {
            if(["qty", "firstInStock", "gip", "rv"].includes(cur)) {
                acc[`${cur}X`] = { "$regex": new RegExp(require("../../functions/escape")(myArgs[index]),"i") };
            } else {
                acc[`${cur}`] = { "$regex": new RegExp(require("../../functions/escape")(myArgs[index]),"i") };
            }
        }
        return acc;
    }, {}));
}