const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {

    const steelType = decodeURI(req.query.steelType);
    const pffType = decodeURI(req.query.pffType);
    const isMultiple = decodeURI(req.query.isMultiple);
    const isComplete = decodeURI(req.query.isComplete);
    const name = decodeURI(req.query.name);
    require("../models/Grade").distinct("name", {
        "steelType": ["undefined", "OTHERS", ""].includes(steelType) ? { $exists: true } : steelType,
        "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType,
        "isComplete": isComplete === "true" ? true : { $exists: true },
        "isMultiple": isMultiple === "false" ? false : { $exists: true },
        "name" : { $regex: new RegExp(`^${require("../functions/escape")(name)}`,"i") }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
});

module.exports = router;