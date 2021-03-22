var express = require('express');
var router = express.Router();

const stockController = require("../controllers/stock_controller");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), stockController.getAll);

module.exports = router;