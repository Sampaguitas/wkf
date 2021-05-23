var express = require('express');
var router = express.Router();

const surfaceController = require("../controllers/surface");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), surfaceController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), surfaceController.getDrop);
router.get("/:surfaceId", passport.authenticate("jwt", { session: false }), surfaceController.getById);

module.exports = router;