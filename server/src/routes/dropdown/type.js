const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {

    const pffType = decodeURI(req.query.pffType);
    const isMultiple = decodeURI(req.query.isMultiple);
    const isComplete = decodeURI(req.query.isComplete);

    require("../../models/Type").distinct("name", {
        "pffType": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType,
        "isMultiple": isMultiple === "false" ? false : { $exists: true },
        "isComplete": isComplete === "true" ? true : { $exists: true }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
});

module.exports = router;