const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {

    const pffType = decodeURI(req.query.pffType);

    require("../../models/Length").aggregate([
        { $match: { "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType } },
        { $sort: { "_id": 1 } },
        { $group: { "_id": "$key", "names": { $push: "$name" } } },
    ]).exec(function (error, result) {
        if (!!error || result.length < 1) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result[0].names);
        }
    });
});

module.exports = router;