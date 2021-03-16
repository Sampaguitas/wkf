const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

router.put("/", (req, res) => {

    const userId = req.body.userId;
    const token = decodeURI(req.body.token);
    const newPassword = req.body.newPassword;

    let query = {userId, token, status: 0 , expire: { $gte: new Date() }}
    let update = { $set: {status: 1} }
    let options = {new : true, upsert: false }
    
    require("../models/Rpwd").findOneAndUpdate(query, update, options, function (errRpwd, resRpwd){
        if (errRpwd) {
            return res.status(400).json({ message: "An error has occured."});
        } else if (!resRpwd) {
            return res.status(400).json({ message: "Your token has expired, request for another reset link." });
        } else {
            bcrypt.genSalt(10, (errSalt, salt) => {
                if (errSalt || !salt) {
                    return res.status(400).json({ message: "Error generating salt." });
                } else {
                    bcrypt.hash(newPassword, salt, (errHash, hash) => {
                        if (errHash || !hash) {
                            return res.status(400).json({ message: "Error generating hash." });                            
                        } else {
                            require("../models/User").findByIdAndUpdate({_id: userId}, { $set: {password: hash} }, function (errUser, resUser) {
                                if (errUser || !resUser) {
                                    return res.status(400).json({ message: "Error updating password." });
                                } else {
                                    return res.status(200).json({ message: "Your password has successfully been updated, go back to the login page." });
                                }
                            });
                        }
                    });
                }
            });                
        }
    });
});

module.exports = router;
