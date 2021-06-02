var express = require('express');
var router = express.Router();

const steelController = require("../controllers/steel");
const passport = require("passport");
router.get("/:steelId", passport.authenticate("jwt", { session: false }), steelController.getById);
router.post("/getAll", passport.authenticate("jwt", { session: false }), steelController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), steelController.getDrop);
router.post("/", passport.authenticate("jwt", { session: false }), steelController.create);
router.put("/:steelId", passport.authenticate("jwt", { session: false }), steelController.update);
router.delete("/:steelId", passport.authenticate("jwt", { session: false }), steelController._delete);

module.exports = router;