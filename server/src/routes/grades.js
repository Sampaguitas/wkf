var express = require('express');
var router = express.Router();

const gradeController = require("../controllers/grade");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), gradeController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), gradeController.getDrop);
router.get("/:gradeId", passport.authenticate("jwt", { session: false }), gradeController.getById);

module.exports = router;