const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const opco = decodeURI(req.query.opco);
    const sizeOne = decodeURI(req.query.sizeOne);
    const sizeTwo = decodeURI(req.query.sizeTwo);
    const wallOne = decodeURI(req.query.wallOne);
    const wallTwo = decodeURI(req.query.wallTwo);
    const type = decodeURI(req.query.type);
    const grade = decodeURI(req.query.grade);
    const length = decodeURI(req.query.length);
    const end = decodeURI(req.query.end);
    const surface = decodeURI(req.query.surface);
    
    let regexOutlet = /^(ELBOL|ELBOWFL|LATROFL|LATROL|NIPOFL|NIPOL|SOCKOL|SWEEPOL|THREADOL|WELDOL)( \d*)?$/
    if (regexOutlet.test(type)) {
        findOutlet(opco, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface).then(result => res.status(200).json(result));
    } else {
        findOther(opco, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface).then(result => res.status(200).json(result));
    }
});

module.exports = router;

function findOther(opco, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface) {
    return new Promise(function(resolve) {
        require("../../models/Param").aggregate([
            {
                $match: {
                    "parameters.sizeOne.tags": sizeOne,
                    "parameters.sizeTwo.tags": !!sizeTwo ? sizeTwo : { $size: 0 },
                    "parameters.wallOne.tags": !!wallOne ? wallOne : { $size: 0 },
                    "parameters.wallTwo.tags": !!wallTwo ? wallTwo : { $size: 0 },
                    "parameters.type.tags": type,
                    "parameters.grade.tags": grade,
                    "parameters.length.tags": !!length ? length : { $exists: true },
                    "parameters.end.tags": !!end ? end : { $exists: true },
                    "parameters.surface.tags": !!surface ? surface : { $size: 0 },
                }
            },
            {
                $lookup: {
                    from: "stocks",
                    localField: "artNr",
                    foreignField: "artNr",
                    as: "stocks"
                }
            },
            {
                $unwind: "$stocks"
            },
            {
                $match: {
                    "stocks.opco": !!opco ? opco : { $exists: true },
                }
            },
            {
                $project: {
                    _id: 0,
                    opco: "$stocks.opco",
                    artNr: "$artNr",
                    qty: "$stocks.qty",
                    uom: "$uom",
                    description: "$description",
                    gip: "$stocks.price.gip",
                    rv: "$stocks.price.rv",
                    supplier: "$stocks.purchase.supplier",
                    purchaseQty: "$stocks.purchase.qty",
                    firstInStock: "$stocks.purchase.firstInStock",
                    deliveryDate: "$stocks.purchase.deliveryDate",
                    nameOne: { $arrayElemAt: ["$stocks.supplier.names", 0] },
                    nameTwo: { $arrayElemAt: ["$stocks.supplier.names", 1] },
                    nameThree: { $arrayElemAt: ["$stocks.supplier.names", 2] },
                    nameFour: { $arrayElemAt: ["$stocks.supplier.names", 3] },
                    qtyOne: { $arrayElemAt: ["$stocks.supplier.qtys", 0] },
                    qtyTwo: { $arrayElemAt: ["$stocks.supplier.qtys", 1] },
                    qtyThree: { $arrayElemAt: ["$stocks.supplier.qtys", 2] },
                    qtyFour: { $arrayElemAt: ["$stocks.supplier.qtys", 3] },
                }
            },
            {
                $sort: {
                    "price.gip": 1
                }
            },
            { $limit : 10 }
        ]).exec(function(error, result) {
            if (!!error || !result) {
                resolve([])
            } else {
                resolve(result);
            }
        });
    });
}

function findOutlet(opco, sizeOne, sizeTwo, wallOne, wallTwo, type, grade, length, end, surface) {
    return new Promise(function(resolve) {
        getSizeMm(sizeTwo).then(mm => {
            require("../../models/Param").aggregate([
                {
                    $match: {
                        "parameters.sizeOne.tags": sizeOne,
                        "parameters.sizeTwo.mm": { $lte: mm },
                        "parameters.sizeThree.mm": { $gte: mm },
                        "parameters.wallOne.tags": wallOne ? wallOne : { $size: 0 },
                        "parameters.wallTwo.tags": !!wallTwo ? wallTwo : { $size: 0 },
                        "parameters.type.tags": type,
                        "parameters.grade.tags": grade,
                        "parameters.length.tags": !!length ? length : { $exists: true },
                        "parameters.end.tags": !!end ? end : { $exists: true },
                        "parameters.surface.tags": !!surface ? surface : { $size: 0 },
                    }
                },
                {
                    $lookup: {
                        from: "stocks",
                        localField: "artNr",
                        foreignField: "artNr",
                        as: "stocks"
                    }
                },
                {
                    $unwind: "$stocks"
                },
                {
                    $match: {
                        "stocks.opco": !!opco ? opco : { $exists: true },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        opco: "$stocks.opco",
                        artNr: "$artNr",
                        qty: "$stocks.qty",
                        uom: "$uom",
                        description: "$description",
                        gip: "$stocks.price.gip",
                        rv: "$stocks.price.rv",
                        supplier: "$stocks.purchase.supplier",
                        purchaseQty: "$stocks.purchase.qty",
                        firstInStock: "$stocks.purchase.firstInStock",
                        deliveryDate: "$stocks.purchase.deliveryDate",
                        nameOne: { $arrayElemAt: ["$stocks.supplier.names", 0] },
                        nameTwo: { $arrayElemAt: ["$stocks.supplier.names", 1] },
                        nameThree: { $arrayElemAt: ["$stocks.supplier.names", 2] },
                        nameFour: { $arrayElemAt: ["$stocks.supplier.names", 3] },
                        qtyOne: { $arrayElemAt: ["$stocks.supplier.qtys", 0] },
                        qtyTwo: { $arrayElemAt: ["$stocks.supplier.qtys", 1] },
                        qtyThree: { $arrayElemAt: ["$stocks.supplier.qtys", 2] },
                        qtyFour: { $arrayElemAt: ["$stocks.supplier.qtys", 3] },
                    }
                },
                {
                    $sort: {
                        "price.gip": 1
                    }
                },
                { $limit : 10 }
            ]).exec(function(error, result) {
                if (!!error || !result) {
                    resolve([])
                } else {
                    resolve(result);
                }
            });
        }).catch( () => resolve([]))
    });
}

function getSizeMm(size) {
    
    return new Promise(function(resolve, reject) {
        require("../../models/Size").findOne({"tags": size, "pffTypes": "FORGED_OLETS"}, function(err, res) {
            if (!!err || !res) {
                reject()
            } else {
                resolve(res.mm);
            }
        });
    });
}