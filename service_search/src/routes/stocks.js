var express = require("express");
const passport = require("passport");
var router = express.Router();

const stockController = require("../controllers/stock_controller");

router.post("/getAll", passport.authenticate("jwt", { session: false }), stockController.getAll);
router.get("/:articleId", passport.authenticate("jwt", { session: false }), stockController.getById);

module.exports = router;