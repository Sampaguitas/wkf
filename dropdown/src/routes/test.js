const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {

    // require("../models/Grade").insertMany(require("../constants/grades.json"))
    // .then(result => res.status(200).json({result}))
    // .catch(error => res.status(400).json({error}));
    res.status(200).json({ user: req.user });
});

module.exports = router;