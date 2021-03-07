const express = require("express");
const router = express.Router();
const Stock = require("../../models/Stock");

router.get("/", (req, res) => {
    const opco = decodeURI(req.query.opco);
    const artNr = decodeURI(req.query.artNr);
    
    Stock.findOne({opco, artNr})
    .populate({
        path: "param",
        select: {
            "_id": 0,
            "artNr": 0,
            "description": 1,
            "uom": 1,
            "weight": 1
        }
    })
    .exec(function(error, result) {
        if (!!error || !result) {
            res.status(200).send({});
        } else {
            res.status(200).send(result);
        }
    });
});

module.exports = router;

            // const system = decodeURI(req.query.system);

            // res.status(200).send({
            //     "artNr": result.artNr,
            //     "opco": result.opco,
            //     "qty": require("../../functions/getQty")(system, result.param.uom, result.qty),
            //     "price": {
            //         "gip": require("../../functions/getPrice")(system, result.param.uom, result.price.gip, 1),
            //         "rv": require("../../functions/getPrice")(system, result.param.uom, result.price.rv, 1),
            //     },
            //     "purchase": {
            //         "supplier": "",
            //         "qty": require("../../functions/getQty")(system, result.param.uom, result.purchase.qty),
            //         "firstInStock": require("../../functions/getQty")(system, result.param.uom, result.purchase.firstInStock),
            //         "deliveryDate": result.purchase.deliveryDate
            //     },
            //     "supplier": {
            //         "names": result.supplier.names,
            //         "qtys": [
            //             require("../../functions/getQty")(system, result.param.uom, result.supplier.qtys[0]),
            //             require("../../functions/getQty")(system, result.param.uom, result.supplier.qtys[1]),
            //             require("../../functions/getQty")(system, result.param.uom, result.supplier.qtys[2]),
            //             require("../../functions/getQty")(system, result.param.uom, result.supplier.qtys[3])
            //         ]
            //     },
            //     "param": {
            //         "description": result.param.description,
            //         "uom": require("../../functions/getUom")(system, result.param.uom),
            //         "weight": require("../../functions/getWeight")(system, result.param.uom, result.param.weight)
            //     }
            // });