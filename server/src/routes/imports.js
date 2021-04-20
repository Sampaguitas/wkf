var express = require('express');
var router = express.Router();
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

const importController = require("../controllers/import");
const passport = require("passport");

router.post("/uploadStock", upload.single("file"), importController.uploadStock);

module.exports = router;