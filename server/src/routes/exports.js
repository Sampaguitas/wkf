var express = require('express');
var router = express.Router();

const exportController = require("../controllers/export");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), exportController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), exportController.getDrop);
router.get("/:exportId", passport.authenticate("jwt", { session: false }), exportController.getById);
router.get("/download/:exportId", passport.authenticate("jwt", { session: false }), exportController.download);
module.exports = router;