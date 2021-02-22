const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", (req, res) => {
    const email = req.body.email.toLowerCase();
    const password = decodeURI(req.body.password);
    require("../models/User").findOne({ email }, { password:1 })
    .then(user => {
        if (!user) {
            return res.status(400).json({ message: "Wrong email or password." });
        } else {
            bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) { 
                    return res.status(400).json({ message: "Wrong email or password." });
                } else {                       
                    const payload = { 
                        id: user.id
                    };
                    jwt.sign(
                        payload,
                        process.env.SECRET,
                        { expiresIn: 86400 }, //day=86400, hour=3600 sec
                        (err, token) => {
                            if (err) {
                                return res.status(400).json({ message: "Could not generate token." });
                            } else {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token,
                                });
                            }
                        }
                    );
                }
            });
        }
    });
});

module.exports = router;