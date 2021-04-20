var express = require("express");
const passport = require("passport");
var router = express.Router();

const stockController = require("../controllers/stock");

router.post("/getAll", passport.authenticate("jwt", { session: false }), stockController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), stockController.getDrop);

router.post("/export/:type", passport.authenticate("jwt", { session: false }), stockController._export);

router.get("/getByArt/:opco/:artNr", passport.authenticate("jwt", { session: false }), stockController.getByArt);
router.get("/:articleId", passport.authenticate("jwt", { session: false }), stockController.getById);

module.exports = router;