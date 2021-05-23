var express = require('express');
var router = express.Router();

const typeController = require("../controllers/type");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), typeController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), typeController.getDrop);
router.get("/:typeId", passport.authenticate("jwt", { session: false }), typeController.getById);

module.exports = router;