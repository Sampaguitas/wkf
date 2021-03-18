const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");

router.post("/", (req, res) => {
    const { _id, name, email } = req.body;
    if (!req.user.isAdmin) {
        res.status(400).json({ message: "You do not have the permission to create or update users." });
    } else if (!name || email) {
        res.status(400).json({ message: "Name or email address is missing." });
    } else if (!_id) {
        createUser(name, email).then(result => res.status(result.isRejected ? 400 : 200).json({ message }));
    } else {
        updateUser(_id, name, email).then(result => res.status(result.isRejected ? 400 : 200).json({ message }));
    }
});

function createUser(name, email) {
    return new Promise(function(resolve) {
        let tempPwd = crypto.randomBytes(32).toString("hex");
        bcrypt.genSalt(10, (errSalt, salt) => {
            if (!!errSalt) {
                resolve({ "isRejected": true, "message": "Error generating salt." });
            } else {
                bcrypt.hash(tempPwd, salt, (errHash, hash) => {
                    if (!!errHash) {
                        resolve({ "isRejected": true, "message": "Error creating the password hash."});
                    } else {
                        let newUser = new require("../models/User")({ name, "email": email.toLowerCase(), "password": hash });
                        newUser
                        .save().then( () => resolve({ "isRejected": false, "message": "New user whas successfuly created." }))
                        .catch( () => resolve({ "isRejected": true, "message": "User could not be created, check if it does not exist already." }));
                    }
                });
            }
        });
    });
}

function updateUser(_id, name, email) {
    return new Promise(function(resolve) {
        let update = { "name": name, "email": email.toLowerCase() };
        let options = { "new": true };
        require("../models/User").findByIdAndUpdate(_id, update, options, function(errUser, user) {
            if (!!errUser || !user) {
                resolve({ "isRejected": true, "message": "User could not be updated." });
            } else {
                resolve({ "isRejected": false, "message": "New user whas successfuly updated." });
            }
        });
    });
}

module.exports = router;

