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
            "description": 1,
            "uom": 1,
            "weight": 1,
            "artNr": 0,
            "_id": 0
        }
    })
    .exec(function(error, result) {
        if (!!error) {
            console.log("error:", error);
            res.status(400).json({message: "could not retreive the article"});
        } else {
            res.status(200).send(result);
        }
    });
});

module.exports = router;