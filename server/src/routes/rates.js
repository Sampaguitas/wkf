var express = require("express");
const passport = require("passport");
var router = express.Router();

const rateController = require("../controllers/rate");

router.get("/currencyTable/:lang", rateController.currencyTable);
router.get("/currencyTable", rateController.currencyTable);

module.exports = router;