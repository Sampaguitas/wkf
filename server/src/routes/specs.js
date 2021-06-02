var express = require('express');
var router = express.Router();

const specController = require("../controllers/spec");
const passport = require("passport");
router.get("/:specId", passport.authenticate("jwt", { session: false }), specController.getById);
router.post("/getAll", passport.authenticate("jwt", { session: false }), specController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), specController.getDrop);
router.post("/", passport.authenticate("jwt", { session: false }), specController.create);
router.put("/:specId", passport.authenticate("jwt", { session: false }), specController.update);
router.delete("/:specId", passport.authenticate("jwt", { session: false }), specController._delete);

module.exports = router;