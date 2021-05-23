var express = require('express');
var router = express.Router();

const wallController = require("../controllers/wall");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), wallController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), wallController.getDrop);
router.get("/:wallId", passport.authenticate("jwt", { session: false }), wallController.getById);

module.exports = router;