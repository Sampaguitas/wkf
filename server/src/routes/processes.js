var express = require('express');
var router = express.Router();

const processController = require("../controllers/process");
const passport = require("passport");

router.post("/getAll", passport.authenticate("jwt", { session: false }), processController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), processController.getDrop);
router.get("/:processId", passport.authenticate("jwt", { session: false }), processController.getById);

module.exports = router;