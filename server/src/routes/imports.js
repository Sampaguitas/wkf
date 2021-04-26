var express = require('express');
var router = express.Router();
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

const importController = require("../controllers/import");
const passport = require("passport");

router.get("/test", passport.authenticate("jwt", { session: false }), importController.test);

router.post("/getAll", passport.authenticate("jwt", { session: false }), importController.getAll);
router.post("/getDrop/:key", passport.authenticate("jwt", { session: false }), importController.getDrop);
router.get("/:importId", passport.authenticate("jwt", { session: false }), importController.getById);
router.get("/downloadParam", passport.authenticate("jwt", { session: false }), importController.downloadParam);
router.post("/uploadParam", passport.authenticate("jwt", { session: false }), upload.single("file"), importController.uploadParam);
router.post("/uploadStock", upload.single("file"), importController.uploadStock);



module.exports = router;