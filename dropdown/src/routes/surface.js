const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const pffType = decodeURI(req.query.pff_type);
    require("../models/Surface").distinct("name", {
        "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
});

module.exports = router;