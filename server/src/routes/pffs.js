var express = require('express');
var router = express.Router();

const pffController = require("../controllers/pff");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), pffController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), pffController.getDrop);
router.get("/:pffId", passport.authenticate("jwt", { session: false }), pffController.getById);

module.exports = router;