const express = require("express");
const router = express.Router();
const _ = require("lodash");

router.get("/", (req, res) => {
    require("../models/Currency").find().exec(function(err, currencies) {
        if (!!err || _.isEmpty(currencies)) {
            res.status(200).json([]);
        } else {
            res.status(200).json(currencies.reduce(function(acc, cur) {
                acc.push(cur._id);
                return acc;
            }, [])
            .sort((a, b) => a.localeCompare(b)));
        };
    });
});

module.exports = router;