var express = require('express');
var router = express.Router();

const exportController = require("../controllers/export_controller");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), exportController.getAll);
router.get("/:exportId", passport.authenticate("jwt", { session: false }), exportController.getById);

module.exports = router;