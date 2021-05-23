module.exports = (myMatch, sort) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$project": {
                "_id": 1,
                "opco": 1,
                "vlunar": 1,
                "artNr": 1,
                "description": 1,
                "qty": 1,
                "gip": "$price.gip",
                "currency": "EUR",
                "rv": "$price.rv",
                "purchaseQty": "$purchase.qty",
                "weight": 1,
                "firstInStock": { "$ifNull": [ "$purchase.firstInStock", 0 ] },
                "uom": 1,
                "supplier": "$purchase.supplier",
                "purchaseDeliveryDate": "$purchase.deliveryDate",
                "nameSupplierOne": { "$arrayElemAt": ["$supplier.names", 0]},
                "nameSupplierTwo": { "$arrayElemAt": ["$supplier.names", 1]},
                "nameSupplierThree": { "$arrayElemAt": ["$supplier.names", 2]},
                "nameSupplierFour": { "$arrayElemAt": ["$supplier.names", 3]},
                "qtySupplierOne": { "$arrayElemAt": ["$supplier.qtys", 0]},
                "qtySupplierTwo": { "$arrayElemAt": ["$supplier.qtys", 1]},
                "qtySupplierThree": { "$arrayElemAt": ["$supplier.qtys", 2]},
                "qtySupplierFour": { "$arrayElemAt": ["$supplier.qtys", 3]}
            }
        },
        {
            "$sort": {
                [!!sort.name ? sort.name : "gip"]: sort.isAscending === false ? -1 : 1,
                "_id": 1
            } 
        },
        {
            "$project": {
                "_id": 0,
                "currency": 0,
            }
        },
    ]
}