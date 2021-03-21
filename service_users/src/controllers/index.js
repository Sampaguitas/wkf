const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const nodemailer = require("nodemailer");
const _ = require("lodash");

const User = require("../models/User");
const Rpwd = require("../models/Rpwd");

const get = (req, res, next) => {

    let pageSize = decodeURI(req.query.pageSize);
    let sortName = decodeURI(req.query.sortName);
    let sortAscending = decodeURI(req.query.sortAscending);
    let filterName = decodeURI(req.query.filterName);
    let filterEmail = decodeURI(req.query.filterEmail);
    let filterAdmin = decodeURI(req.query.filterAdmin);

    let nextPage = req.body.nextPage || 1;
    if (!pageSize) {
        res.status(400).json({message: "Page size should be greater than 0."});
    } else {
        User.find({
            name : { $regex: new RegExp(require("../functions/escape")(filterName),"i") },
            email : { $regex: new RegExp(require("../functions/escape")(filterEmail),"i") },
            isAdmin: { $in: require("../functions/filterBool")(filterAdmin)},
        })
        .sort({
            [!!sortName ? sortName : "name"]: sortAscending === false ? -1 : 1
        })
        // .skip((nextPage - 1) * pageSize)
        // .limit(pageSize)
        .exec(function (err, users) {
            if (!!err) {
                res.status(400).json({ message: "An error has occured." });
            } else {
                
                let pageLast = Math.ceil(users.length / pageSize) || 1;
                let sliced = users.slice((nextPage - 1) * pageSize, ((nextPage - 1) * pageSize) + pageSize);
                let firstItem = !_.isEmpty(sliced) ? ((nextPage - 1) * pageSize) + 1 : 0;
                let lastItem = !_.isEmpty(sliced) ? firstItem + sliced.length - 1 : 0;
                
                res.json({
                    users: sliced,
                    currentPage: nextPage,
                    firstItem: firstItem,
                    lastItem: lastItem,
                    pageItems: sliced.length,
                    pageLast: pageLast,
                    totalItems: users.length,
                    first: nextPage < 4 ? 1 : (nextPage === pageLast) ? nextPage - 2 : nextPage - 1,
                    second: nextPage < 4 ? 2 : (nextPage === pageLast) ? nextPage - 1 : nextPage,
                    third: nextPage < 4 ? 3 : (nextPage === pageLast) ? nextPage : nextPage + 1,
                });
            }
        });
    } 
}

const getById = (req, res, next) => {

    const {userId} = req.params;

    User.findById(userId, function (err, user) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!user) {
            res.status(400).json({ message: "Could not retrieve user information." });
        } else {
            res.json({user: user});
        }
    });
}

const login = (req, res, next) => {
    
    const email = req.body.email.toLowerCase();
    const password = decodeURI(req.body.password);

    User.findOne({ email }, { password:1, name: 1, isAdmin: 1 })
    .then(user => {
        if (!user) {
            res.status(400).json({ message: "Wrong email or password." });
        } else {
            bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) { 
                    res.status(400).json({ message: "Wrong email or password." });
                } else {                       
                    const payload = { 
                        "_id": user._id,
                        "name": user.name,
                        "email": user.email,
                        "isAdmin": user.isAdmin
                    };
                    jwt.sign(
                        payload,
                        process.env.SECRET,
                        { expiresIn: 86400 }, //day=86400, hour=3600 sec
                        (err, token) => {
                            if (err) {
                                res.status(400).json({ message: "Could not generate token." });
                            } else {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token,
                                    isAdmin: payload.isAdmin,
                                });
                            }
                        }
                    );
                }
            });
        }
    });
}

const reqPwd = (req, res, next) => {

    const email = req.body.email.toLowerCase();

    let transporter = nodemailer.createTransport({
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        secure: false,
        auth: {
          user: process.env.MAILER_AUTH_USER, 
          pass: process.env.MAILER_AUTH_PASS
        }
    });
    
    if (!email) {
        res.status(400).json({ message: "Email is required." });
    } else {
        User.findOne({email}, function(err, user) {
            if (!!err) {
                res.status(400).json({ message: "An error has occured." });
            } else if (!user) {
                res.status(400).json({ message: "Email address does not exist." });
            } else {
                let token = crypto.randomBytes(32).toString("hex");
                let query = { userId: user._id, status: 0 }
                let update = {token: token, expire: moment.utc().add(3600, "seconds")}
                let options = {new: true, upsert: true}
                Rpwd.findOneAndUpdate(query, update, options, function (errRpwd, resRpwd) {
                    if (errRpwd || !resRpwd) {
                        res.status(400).json({message: "Error generating hashed token."});
                    } else {
                        let mailOptions = {
                            from: process.env.MAILER_AUTH_USER + " <" + process.env.MAILER_AUTH_USER + ">",
                            to: user.email,
                            subject: "Reset your account password",
                            html: "<h2>Capex work file</h2>" +
                            "<p>Hi,</p>" +
                            `<p>Please click on the following <a href=${process.env.REACT_APP_API_URI}/account/resetpwd?id=${user._id}&token=${encodeURI(token)}>link</a> within the next hour to reset your password,</p>` +
                            "<p>Thanks,</p>" +
                            "<br/>" +
                            "<p>Global Project Organisation (GPO)</p>" +
                            "<b>Van Leeuwen Pipe and Tube</b>"
                        };
                        transporter.sendMail(mailOptions, (errSendMail, resSendMail) => {
                            if (!!errSendMail || !resSendMail) {
                                res.status(400).json({ message: "We where not able to send the verificatin link." });                                            
                            } else {
                                res.status(200).json({ message: "Check your email to reset your password." });
                            }
                        });
                    }
                });
            }
        });
    }   
}

const resetPwd = (req, res, next) => {

    const {userId} = req.params;
    const {token, newPassword} = req.body;

    let query = {userId, token, status: 0 , expire: { $gte: new Date() }}
    let update = { $set: {status: 1} }
    let options = {new : true, upsert: false }
    
    Rpwd.findOneAndUpdate(query, update, options, function (errRpwd, resRpwd){
        if (errRpwd) {
            res.status(400).json({ message: "An error has occured."});
        } else if (!resRpwd) {
            res.status(400).json({ message: "Token has expired." });
        } else {
            bcrypt.genSalt(10, (errSalt, salt) => {
                if (errSalt || !salt) {
                    res.status(400).json({ message: "Error generating salt." });
                } else {
                    bcrypt.hash(newPassword, salt, (errHash, hash) => {
                        if (errHash || !hash) {
                            res.status(400).json({ message: "Error generating hash." });                            
                        } else {
                            User.findByIdAndUpdate({_id: userId}, { $set: {password: hash} }, function (errUser, resUser) {
                                if (!!errUser || !resUser) {
                                    res.status(400).json({ message: "Error updating password." });
                                } else {
                                    res.status(200).json({ message: "Your password has successfully been updated." });
                                }
                            });
                        }
                    });
                }
            });         
        }
    });
}

const updatePwd = (req, res, next) => {
    const { newPwd } = req.body;

    if (!newPwd) {
        res.status(400).json({message: "Password cannot be emty."})
    } else {
        bcrypt.genSalt(10, (errSalt, salt) => {
            if (errSalt || !salt) {
                res.status(400).json({ message: "Error generating salt." });
            } else {
                bcrypt.hash(newPwd, salt, (errHash, hash) => {
                    if (errHash || !hash) {
                        res.status(400).json({ message: "Error generating hash." });                            
                    } else {
                        require("../models/User").findByIdAndUpdate({_id: req.user._id}, { $set: {password: hash} }, { new: true }, function (errUser, resUser) {
                            if (errUser || !resUser) {
                                res.status(400).json({ message: "Your password could not be updated." });
                            } else {
                                res.status(200).json({ message: "Your password has successfully been updated." });
                            }
                        });
                    }
                });
            }
        });
    }
}

const create = (req, res, next) => {
    
    const user = req.user;
    const { name, email } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to create users"})
    } else if (!name || !email) {
        res.status(400).json({message: "User name and email cannot be emty."})
    } else {
        let tempPwd = crypto.randomBytes(32).toString("hex");
        bcrypt.genSalt(10, (errSalt, salt) => {
            if (!!errSalt) {
                res.status(400).json({message: "Error generating salt." });
            } else {
                bcrypt.hash(tempPwd, salt, (errHash, hash) => {
                    if (!!errHash) {
                        res.status(400).json({message: "Error creating the password hash."});
                    } else {
                        let newUser = new User({
                            name, "email": email.toLowerCase(),
                            "password": hash
                        });

                        newUser
                        .save()
                        .then( () => res.status(200).json({message: "User has uccessfuly been created." }))
                        .catch( () => res.status(400).json({message: "User could not be created." }));
                    }
                });
            }
        });
    }
}

const update = (req, res, next) => {
        
    const user = req.user;
    const {userId} = req.params;
    const { name, email } = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to update user information."})
    } else if (!userId) {
        res.status(400).json({message: "User ID is missing."});
    } else if (!name || !email) {
        res.status(400).json({message: "User name and email cannot be emty."})
    } else {
        let update = { "name": name, "email": email.toLowerCase() };
        let options = { "new": true };
        User.findByIdAndUpdate(_id, update, options, function(errUser, user) {
            if (!!errUser || !user) {
                res.status(400).json({message: "User could not be updated." });
            } else {
                res.status(200).json({message: "User has successfuly been updated." });
            }
        });
    }
}

const _delete = (req, res, next) => {
        
    const user = req.user;
    const {userId} = req.params;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to delete users."})
    } else if (!userId) {
        res.status(400).json({message: "User ID is missing."});
    } else {
        User.findByIdAndDelete(_id, function(errUser, user) {
            if (!!errUser || !user) {
                res.status(400).json({message: "User could not be deleted." });
            } else {
                res.status(200).json({message: "User has successfuly been deleted." });
            }
        });
    }
}

const userController = {
    get,
    getById,
    login,
    reqPwd,
    resetPwd,
    updatePwd,
    create,
    update,
    _delete,
};
  
module.exports = userController;