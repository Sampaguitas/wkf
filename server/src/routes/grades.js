var express = require('express');
var router = express.Router();

const gradeController = require("../controllers/grade");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), gradeController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), gradeController.getDrop);
router.get("/:gradeId", passport.authenticate("jwt", { session: false }), gradeController.getById);
router.post("/", passport.authenticate("jwt", { session: false }), gradeController.create);
router.put("/:gradeId", passport.authenticate("jwt", { session: false }), gradeController.update);
router.delete("/:gradeId", passport.authenticate("jwt", { session: false }), gradeController._delete);

module.exports = router;