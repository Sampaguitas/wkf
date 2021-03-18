const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    require('../models/User').findById(req.user._id, function (err, user) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured, try refreshing this page.'})
        } if (!user) {
            return res.status(400).json({ message: 'Could not retrieve user information, try refreshing this page.' });
        } else {
            return res.json({user: user});
        }
    });
});

module.exports = router;