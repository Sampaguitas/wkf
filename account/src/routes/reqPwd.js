const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const moment = require("moment");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    secure: false,
    auth: {
      user: process.env.MAILER_AUTH_USER, 
      pass: process.env.MAILER_AUTH_PASS
    }
});

router.post("/", (req, res) => {
    const email = req.body.email.toLowerCase();
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    } else {
        require("../models/User").findOne({email}, function(err, user) {
            if (err) {
                return res.status(400).json({ message: "An error has occured." });
            } else if (!user) {
                return res.status(400).json({ message: "User does not exist." });
            } else {
                let token = crypto.randomBytes(32).toString("hex");
                let query = { userId: user._id, status: 0 }
                let update = {token: token, expire: moment.utc().add(3600, "seconds")}
                let options = {new: true, upsert: true}
                require("../models/Rpwd").findOneAndUpdate(query, update, options, function (errRpwd, resRpwd) {
                    if (errRpwd || !resRpwd) {
                        return res.status(400).json({message: "Error generating hashed token."});
                    } else {
                        let mailOptions = {
                            from: "Timothee Desurmont" + " <" + process.env.MAILER_AUTH_USER + ">",
                            to: user.email,
                            subject: "Reset your account password",
                            html: "<h2>Reconciliation Database (RDB)</h2>" +
                            "<p>Hi,</p>" +
                            `<p>Please click on the following <a href=/server/resetpwd?id=${user._id}&token=${encodeURI(token)}>link</a> within the next hour to reset your password,</p>` +
                            "<p>Thanks,</p>" +
                            "<br/>" +
                            "<p>Global Project Organisation</p>" +
                            "<b>Van Leeuwen Pipe and Tube</b>"
                        };
                        transporter.sendMail(mailOptions, (errSendMail, resSendMail) => {
                            if (errSendMail || !resSendMail) {
                                return res.status(400).json({ message: "We where not able to send the verificatin link." });                                            
                            } else {
                                return res.status(200).json({ message: "Check your email to reset your password." });
                            }
                        });
                    }
                });
            }
        });
    }   
});

module.exports = router;
