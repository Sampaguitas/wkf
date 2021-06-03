var express = require('express');
var router = express.Router();

const typeController = require("../controllers/type");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), typeController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), typeController.getDrop);
router.get("/:typeId", passport.authenticate("jwt", { session: false }), typeController.getById);
router.post("/", passport.authenticate("jwt", { session: false }), typeController.create);
router.put("/:typeId", passport.authenticate("jwt", { session: false }), typeController.update);
router.delete("/:typeId", passport.authenticate("jwt", { session: false }), typeController._delete);

module.exports = router;