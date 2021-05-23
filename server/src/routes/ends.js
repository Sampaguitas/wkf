var express = require('express');
var router = express.Router();

const endController = require("../controllers/end");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), endController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), endController.getDrop);
router.get("/:endId", passport.authenticate("jwt", { session: false }), endController.getById);

module.exports = router;