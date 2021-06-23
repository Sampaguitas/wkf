var express = require('express');
var router = express.Router();

const wallController = require("../controllers/wall");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), wallController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), wallController.getDrop);
router.get("/:wallId", passport.authenticate("jwt", { session: false }), wallController.getById);
router.post("/", passport.authenticate("jwt", { session: false }), wallController.create);
router.put("/:wallId", passport.authenticate("jwt", { session: false }), wallController.update);
router.delete("/:wallId", passport.authenticate("jwt", { session: false }), wallController._delete);

module.exports = router;