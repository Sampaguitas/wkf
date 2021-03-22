const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");

router.get("/", (req, res) => {
    const opco = decodeURI(req.query.opco);
    const artNr = decodeURI(req.query.artNr);
    const system = decodeURI(req.query.system);
    
    Stock.findOne({opco, artNr})
    .populate({ path: "param" })
    .exec(function(error, result) {
        if (!!error || !result) {
            res.status(200).send({});
        } else {
            res.status(200).send({
                "opco": result.opco,
                "artNr": result.artNr,
                "description": result.param.description,
                "qty": require("../functions/getQty")(system, result.param.uom, result.qty),
                "uom": require("../functions/getUom")(system, result.param.uom),
                "weight": require("../functions/getWeight")(system, result.param.uom, result.param.weight),
                "price": {
                    "gip": require("../functions/getPrice")(system, result.param.uom, result.price.gip, 1),
                    "rv": require("../functions/getPrice")(system, result.param.uom, result.price.rv, 1),
                },
                "purchase": {
                    "supplier": "",
                    "qty": require("../functions/getQty")(system, result.param.uom, result.purchase.qty),
                    "firstInStock": require("../functions/getQty")(system, result.param.uom, result.purchase.firstInStock),
                    "deliveryDate": result.purchase.deliveryDate
                },
                "supplier": {
                    "names": result.supplier.names,
                    "qtys": [
                        require("../functions/getQty")(system, result.param.uom, result.supplier.qtys[0]),
                        require("../functions/getQty")(system, result.param.uom, result.supplier.qtys[1]),
                        require("../functions/getQty")(system, result.param.uom, result.supplier.qtys[2]),
                        require("../functions/getQty")(system, result.param.uom, result.supplier.qtys[3])
                    ]
                }
            });
        }
    });
});

module.exports = router;