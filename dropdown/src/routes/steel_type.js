const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json(require("../constants/steel_types.json"));
});

module.exports = router;
