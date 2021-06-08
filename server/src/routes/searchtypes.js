var express = require('express');
var router = express.Router();

const searchtypeController = require("../controllers/searchtype");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), searchtypeController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), searchtypeController.getDrop);
router.get("/:searchtypeId", passport.authenticate("jwt", { session: false }), searchtypeController.getById);
router.post("/", passport.authenticate("jwt", { session: false }), searchtypeController.create);
router.put("/:searchtypeId", passport.authenticate("jwt", { session: false }), searchtypeController.update);
router.delete("/:searchtypeId", passport.authenticate("jwt", { session: false }), searchtypeController._delete);

module.exports = router;