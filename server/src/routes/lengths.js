var express = require('express');
var router = express.Router();

const lengthController = require("../controllers/length");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), lengthController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), lengthController.getDrop);
router.get("/:lengthId", passport.authenticate("jwt", { session: false }), lengthController.getById);

module.exports = router;