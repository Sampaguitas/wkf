var express = require('express');
var router = express.Router();

const pffController = require("../controllers/pff");
const passport = require("passport");

router.get("/:pffId", passport.authenticate("jwt", { session: false }), pffController.getById);
router.post("/getAll", passport.authenticate("jwt", { session: false }), pffController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), pffController.getDrop);
router.post("/", passport.authenticate("jwt", { session: false }), pffController.create);
router.put("/:pffId", passport.authenticate("jwt", { session: false }), pffController.update);
router.delete("/:pffId", passport.authenticate("jwt", { session: false }), pffController._delete);

module.exports = router;