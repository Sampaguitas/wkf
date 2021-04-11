module.exports = (system) => {
    return {
        "_id": "$_id",
        "opco": "$opco",
        "vlunar": "$vlunar",
        "artNr": "$artNr",
        "description": "$description",
        "qty": {
            "$cond": [ 
                { "$eq": [system, "IMPERIAL"] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$qty", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$qty", 3.28084 ] } }
                        ],
                        default: "$qty"
                    }
                },
                "$qty"
            ]
        },
        "gip": {
            "$cond": [
                { "$eq": [ system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$price.gip", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$price.gip", 3.28084 ] } }
                        ],
                        default: "$price.gip"
                    }
                },
                "$price.gip"
            ],
        },
        "currency": "EUR",
        "rv": {
            "$cond": [
                { "$eq": [ system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$price.rv", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$price.rv", 3.28084 ] } }
                        ],
                        default: "$price.rv"
                    }
                },
                "$price.rv"
            ],
        },
        "purchaseQty": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$purchase.qty", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$purchase.qty", 3.28084 ] } }
                        ],
                        "default": "$purchase.qty"
                    }
                },
                "$purchase.qty"
            ],
        },
        "weight": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$weight", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$weight", 0.671969 ] } }
                        ],
                        "default": "$weight"
                    }
                },
                "$weight"
            ],
        },
        "firstInStock": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$purchase.firstInStock", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$purchase.firstInStock", 3.28084 ] } }
                        ],
                        "default": "$purchase.firstInStock"
                    }
                },
                "$purchase.firstInStock"
            ],
        },
        "uom": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": "LB" },
                            { "case": { "$eq": [ "$uom", "LB" ] }, "then": "LB" },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": "FT" },
                            { "case": { "$eq": [ "$uom", "FT" ] }, "then": "FT" },
                        ],
                        default: "ST"
                    }
                },
                "$uom"
            ],
        },
        "supplier": "$purchase.supplier",
        "purchaseDeliveryDate": "$purchase.deliveryDate",
        "nameSupplierOne": { "$arrayElemAt": ["$supplier.names", 0]},
        "nameSupplierTwo": { "$arrayElemAt": ["$supplier.names", 1]},
        "nameSupplierThree": { "$arrayElemAt": ["$supplier.names", 2]},
        "nameSupplierFour": { "$arrayElemAt": ["$supplier.names", 3]},
        "qtySupplierOne": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 0]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 0]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 0]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 0]}
            ],
        },
        "qtySupplierTwo": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 1]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 1]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 1]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 1]}
            ],
        },
        "qtySupplierThree": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 2]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 2]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 2]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 2]}
            ],
        },
        "qtySupplierFour": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 3]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 3]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 3]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 3]}
            ],
        }
    }
}