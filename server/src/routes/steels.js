var express = require('express');
var router = express.Router();

const steelController = require("../controllers/steel");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), steelController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), steelController.getDrop);
router.get("/:steelId", passport.authenticate("jwt", { session: false }), steelController.getById);

module.exports = router;