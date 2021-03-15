const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {

    const pffType = decodeURI(req.query.pffType);
    const name = decodeURI(req.query.name);
    
    require("../models/Length").aggregate([
        { 
            $match: { 
                "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType,
                "name" : { $regex: new RegExp(`^${require("../functions/escape")(name)}`,'i') }
            }
        },
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