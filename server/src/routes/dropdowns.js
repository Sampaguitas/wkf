var express = require('express');
var router = express.Router();

const dropdownController = require("../controllers/dropdown_controller");
const passport = require("passport");

router.get("/artNr", passport.authenticate("jwt", { session: false }), dropdownController.artNr);
router.get("/currency", passport.authenticate("jwt", { session: false }), dropdownController.currency);
router.get("/end", passport.authenticate("jwt", { session: false }), dropdownController.end);
router.get("/grade", passport.authenticate("jwt", { session: false }), dropdownController.grade);
router.get("/length", passport.authenticate("jwt", { session: false }), dropdownController.length);
router.get("/opco", passport.authenticate("jwt", { session: false }), dropdownController.opco);
router.get("/pffType", passport.authenticate("jwt", { session: false }), dropdownController.pffType);
router.get("/sizeOne", passport.authenticate("jwt", { session: false }), dropdownController.sizeOne);
router.get("/sizeThree", passport.authenticate("jwt", { session: false }), dropdownController.sizeThree);
router.get("/sizeTwo", passport.authenticate("jwt", { session: false }), dropdownController.sizeTwo);
router.get("/steelType", passport.authenticate("jwt", { session: false }), dropdownController.steelType);
router.get("/surface", passport.authenticate("jwt", { session: false }), dropdownController.surface);
router.get("/type", passport.authenticate("jwt", { session: false }), dropdownController.type);
router.get("/wallOne", passport.authenticate("jwt", { session: false }), dropdownController.wallOne);
router.get("/wallTwo", passport.authenticate("jwt", { session: false }), dropdownController.wallTwo);

module.exports = router;