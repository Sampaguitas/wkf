var express = require("express");
const passport = require("passport");
var router = express.Router();

const testController = require("../controllers/test_controller");

router.post("/getParams", passport.authenticate("jwt", { session: false }), testController.getParams);
router.post("/getStocks", passport.authenticate("jwt", { session: false }), testController.getStocks);

module.exports = router;