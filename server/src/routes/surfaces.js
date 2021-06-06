var express = require('express');
var router = express.Router();

const surfaceController = require("../controllers/surface");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), surfaceController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), surfaceController.getDrop);
router.get("/:surfaceId", passport.authenticate("jwt", { session: false }), surfaceController.getById);
router.post("/", passport.authenticate("jwt", { session: false }), surfaceController.create);
router.put("/:surfaceId", passport.authenticate("jwt", { session: false }), surfaceController.update);
router.delete("/:surfaceId", passport.authenticate("jwt", { session: false }), surfaceController._delete);


module.exports = router;