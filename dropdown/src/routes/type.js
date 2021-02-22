const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const pff_type = decodeURI(req.query.pff_type);
    const is_multiple = decodeURI(req.query.is_multiple)
    res.status(200).json(require("../constants/types.json")
    .filter(e => !!req.query.pff_type && pff_type !== "OTHERS" ? e.pffType === pff_type : true)
    .filter(e => is_multiple === "false" ? e.isMultiple === false : true)
    .reduce(function (acc, cur) {
        acc.push(cur.name);
        return acc;
    }, [])
    .sort((a, b) => a.localeCompare(b)));
});

module.exports = router;