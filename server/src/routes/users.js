var express = require('express');
var router = express.Router();

const userController = require("../controllers/user");
const passport = require("passport");

router.get("/:userId", passport.authenticate("jwt", { session: false }), userController.getById);//server

router.post("/login", userController.login);
router.post("/reqPwd", userController.reqPwd);
router.post("/getAll", passport.authenticate("jwt", { session: false }), userController.getAll);//server
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), userController.getDrop);

router.post("/", passport.authenticate("jwt", { session: false }), userController.create);

router.put("/resetPwd/:userId", userController.resetPwd);
router.put("/updatePwd", passport.authenticate("jwt", { session: false }), userController.updatePwd);
router.put("/setAdmin/:userId", passport.authenticate("jwt", { session: false }), userController.setAdmin);
router.put("/genKey", passport.authenticate("jwt", { session: false }), userController.genKey);
router.put("/:userId", passport.authenticate("jwt", { session: false }), userController.update);


router.delete("/:userId", passport.authenticate("jwt", { session: false }), userController._delete);

module.exports = router;