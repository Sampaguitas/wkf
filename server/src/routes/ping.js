var express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({ message: "pong"});
});

module.exports = router;