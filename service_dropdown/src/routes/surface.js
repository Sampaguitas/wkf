const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const pffType = decodeURI(req.query.pffType);
    const name = decodeURI(req.query.name);
    require("../models/Surface").distinct("name", {
        "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType,
        "name": { $regex: new RegExp(`^${require("../functions/escape")(name)}`,'i') }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
});

module.exports = router;