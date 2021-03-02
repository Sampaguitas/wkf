const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    require("../../models/Pff").distinct("name").exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
});

module.exports = router;
