const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const nodemailer = require("nodemailer");
const _ = require("lodash");

const login = (req, res, next) => {
    
    const email = req.body.email.toLowerCase();
    const {password} = req.body;

    require("../models/User").findOne({ email }, { password:1, name: 1, isAdmin: 1, accountId: 1 })
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
                        "isAdmin": user.isAdmin,
                        "accountId": user.accountId
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
                                    _id: user._id,
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
        require("../models/User").findOne({email}, function(err, user) {
            if (!!err) {
                res.status(400).json({ message: "An error has occured." });
            } else if (!user) {
                res.status(400).json({ message: "Email address does not exist." });
            } else {
                let token = crypto.randomBytes(32).toString("hex");
                let query = { userId: user._id, status: 0 }
                let update = {token: token, expire: moment.utc().add(3600, "seconds")}
                let options = {new: true, upsert: true}
                require("../models/Rpwd").findOneAndUpdate(query, update, options, function (errRpwd, resRpwd) {
                    if (errRpwd || !resRpwd) {
                        res.status(400).json({message: "Error generating hashed token."});
                    } else {
                        let mailOptions = {
                            from: process.env.MAILER_AUTH_USER + " <" + process.env.MAILER_AUTH_USER + ">",
                            to: user.email,
                            subject: "Reset your account password",
                            html: "<h2>Capex work file</h2>" +
                            "<p>Hi,</p>" +
                            `<p>Please click on the following <a href=${process.env.REACT_APP_CL_URI}/resetPwd/?id=${user._id}&token=${encodeURI(token)}>link</a> within the next hour to reset your password,</p>` +
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
    const {id, token, newPwd} = req.body;

    let query = {userId, token, status: 0 , expire: { $gte: new Date() }}
    let update = { $set: {status: 1} }
    let options = {new : true, upsert: false }
    
    require("../models/Rpwd").findOneAndUpdate(query, update, options, function (errRpwd, resRpwd){
        if (errRpwd) {
            res.status(400).json({ message: "An error has occured."});
        } else if (!resRpwd) {
            res.status(400).json({ message: "Token has expired." });
        } else {
            bcrypt.genSalt(10, (errSalt, salt) => {
                if (errSalt || !salt) {
                    res.status(400).json({ message: "Error generating salt." });
                } else {
                    bcrypt.hash(newPwd, salt, (errHash, hash) => {
                        if (errHash || !hash) {
                            res.status(400).json({ message: "Error generating hash." });                            
                        } else {
                            require("../models/User").findByIdAndUpdate(userId, { $set: {password: hash} }, function (errUser, resUser) {
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
    const user = req.user;
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
                        require("../models/User").findByIdAndUpdate(user._id, { $set: {password: hash} }, { new: true }, function (errUser, resUser) {
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
                        let newUser = new require("../models/User")({
                            name, "email": email.toLowerCase(),
                            "password": hash,
                            "accountId": user.accountId
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
        require("../models/User").findByIdAndUpdate(userId, update, options, function(errUser, user) {
            if (!!errUser || !user) {
                res.status(400).json({message: "User could not be updated." });
            } else {
                res.status(200).json({message: "User has successfuly been updated." });
            }
        });
    }
}

const genKey = (req, res, next) => {
    const user = req.user;
    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to create users"})
    } else if (!user.accountId) {
        res.status(400).json({message: "Could not get retreive your accountId."})
    } else {
        let key = crypto.randomBytes(32).toString("hex");
        bcrypt.genSalt(10, (errSalt, salt) => {
            if (!!errSalt) {
                res.status(400).json({message: "Error generating salt." });
            } else {
                bcrypt.hash(key, salt, (errHash, hash) => {
                    if (!!errHash || !hash) {
                        res.status(400).json({message: "Error creating the key hash."});
                    } else {
                        require("../models/Account").findByIdAndUpdate(user.accountId, { "uploadKey": hash }, function(err, doc) {
                            if (!!err || !doc) {
                                res.status(400).json({message: "Could not save the new upload key."});
                            } else {
                                res.status(200).json({key: key });
                            }
                        });
                    }
                });
            }
        });
    }
}

const setAdmin = (req, res, next) => {
    
    const user = req.user;
    const {userId} = req.params;
    const {isAdmin} = req.body;

    if (!user.isAdmin) {
        res.status(400).json({message: "You do not have the permission to update user information."})
    } else if (!userId) {
        res.status(400).json({message: "User ID is missing."});
    } else if (userId === user._id) {
        res.status(400).json({message: "You do not have the permission to update your own role."})
    } else {
        let update = { isAdmin };
        let options = { "new": true };
        require("../models/User").findByIdAndUpdate(userId, update, options, function (errUser, user) {
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
        require("../models/User").findByIdAndDelete(userId, function(errUser, user) {
            if (!!errUser || !user) {
                res.status(400).json({message: "User could not be deleted." });
            } else {
                res.status(200).json({message: "User has successfuly been deleted." });
            }
        });
    }
}

const getById = (req, res, next) => {

    const {userId} = req.params;

    require("../models/User").findById(userId, function (err, user) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!user) {
            res.status(400).json({ message: "Could not retrieve user information." });
        } else {
            res.json({user: user});
        }
    });
}


const getAll = (req, res, next) => {
    const user = req.user;
    const { dropdown, sort } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;
    matchDropdown(dropdown.name, dropdown.email, dropdown.isAdmin).then(myMatch => {
        require("../models/User").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/user")(myMatch, user.accountId),
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "name"]: sort.isAscending === false ? -1 : 1,
                                "_id": 1
                            }
                        },
                        { "$skip": ((nextPage - 1) * pageSize) },
                        { "$limit": pageSize },
                        {
                            "$project": {
                                "_id": 1,
                                "name": 1,
                                "email": 1,
                                "isAdmin": 1,
                                "isAdminX": 1,
                                "accountId": 1
                            }
                        }
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/user")(myMatch, user.accountId),
                        { "$count": "totalItems" },
                        {
                            "$addFields": {
                                "nextPage": nextPage,
                                "pageSize": pageSize
                                
                            }
                        }
                    ]
                }
            },
            {
                "$project": require("../pipelines/projection/result")(nextPage, pageSize)
            }
        ]).exec(function(error, result) {
            if (!!error || !result) {
                res.status(200).json([])
            } else {
                res.status(200).json(result)
            } 
        });
    });
}

const getDrop = (req, res, next) => {
    const user = req.user;
    const { dropdown, name } = req.body;
    let page = req.body.page || 0;
    const {key} = req.params;
    matchDropdown(dropdown.name, dropdown.email, dropdown.isAdmin).then(myMatch => {
        switch(key) {
            case "name":
            case "email":
                require("../models/User").aggregate([
                    ...require("../pipelines/first_stage/user")(myMatch, user.accountId),
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$addToSet": `$${key}`}
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    } 
                });
                break;
            case "isAdmin":
                require("../models/User").aggregate([
                    ...require("../pipelines/first_stage/user")(myMatch, user.accountId),
                    {
                        "$group": {
                            "_id": null,
                            "data":{ "$addToSet": `$${key}X`}
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                        res.status(200).json([]);
                    } else {
                        res.status(200).json(result[0].data);
                    } 
                });
                break;
            default: res.status(200).json([]);
        }
    });
}

function matchDropdown() {
    let myArgs = arguments;
    return new Promise(function(resolve) {
        resolve(["name", "email", "isAdmin"].reduce(function(acc, cur, index) {
            if (!!myArgs[index]) {
                if (cur === "isAdmin" && myArgs[index] === "false") {
                    acc[`${cur}`] = { "$ne": true };
                } else if (cur === "isAdmin" && myArgs[index] === "true") {
                    acc[`${cur}`] = { "$eq": true };
                } else {
                    acc[`${cur}`] = myArgs[index];
                }
            }
            return acc;
        },{}));
    });
}

const userController = {
    login,
    reqPwd,
    resetPwd,
    updatePwd,
    create,
    genKey,
    update,
    setAdmin,
    _delete,
    getAll,
    getDrop,
    getById
};

module.exports = userController;