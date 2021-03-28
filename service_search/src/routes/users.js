var express = require('express');
var router = express.Router();

const userController = require("../controllers/user_controller");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), userController.getAll);
router.get("/:userId", passport.authenticate("jwt", { session: false }), userController.getById);

module.exports = router;