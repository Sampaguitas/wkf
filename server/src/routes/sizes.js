var express = require('express');
var router = express.Router();

const sizeController = require("../controllers/size");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), sizeController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), sizeController.getDrop);
router.get("/:sizeId", passport.authenticate("jwt", { session: false }), sizeController.getById);
router.post("/", passport.authenticate("jwt", { session: false }), sizeController.create);
router.put("/:sizeId", passport.authenticate("jwt", { session: false }), sizeController.update);
router.delete("/:sizeId", passport.authenticate("jwt", { session: false }), sizeController._delete);

module.exports = router;