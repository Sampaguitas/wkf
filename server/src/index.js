const bodyParser = require("body-parser");
const passport = require("passport");
const app = require("express")();
var CronJob = require('cron').CronJob;
const fetch = require("node-fetch");

app.use(require("cors")());

//bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Passport config file
app.use(passport.initialize());
require("./models/index.js");
require("./config/passport")(passport);

// Connect to MongoDB
require("mongoose")
.set("useFindAndModify", false)
.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Listen on port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));

app.use("/dropdowns", require("./routes/dropdowns"));
app.use("/exports", require("./routes/exports"));
app.use("/imports", require("./routes/imports"));
app.use("/rates", require("./routes/rates"));
app.use("/stocks", require("./routes/stocks"));
app.use("/users", require("./routes/users"));
//params
app.use("/ends", require("./routes/ends"));
app.use("/grades", require("./routes/grades"));
app.use("/lengths", require("./routes/lengths"));
app.use("/pffs", require("./routes/pffs"));
app.use("/sizes", require("./routes/sizes"));
app.use("/steels", require("./routes/steels"));
app.use("/surfaces", require("./routes/surfaces"));
app.use("/types", require("./routes/types"));
app.use("/walls", require("./routes/walls"));


//without nginx
app.use("/server/dropdowns", require("./routes/dropdowns"));
app.use("/server/imports", require("./routes/imports"));
app.use("/server/exports", require("./routes/exports"));
app.use("/server/rates", require("./routes/rates"));
app.use("/server/stocks", require("./routes/stocks"));
app.use("/server/users", require("./routes/users"));
//params
app.use("/server/ends", require("./routes/ends"));
app.use("/server/grades", require("./routes/grades"));
app.use("/server/lengths", require("./routes/lengths"));
app.use("/server/pffs", require("./routes/pffs"));
app.use("/server/sizes", require("./routes/sizes"));
app.use("/server/steels", require("./routes/steels"));
app.use("/server/surfaces", require("./routes/surfaces"));
app.use("/server/types", require("./routes/types"));
app.use("/server/walls", require("./routes/walls"));


let isProcessing = false;
var updateRates = new CronJob("0 0 0 * * *", function() {
  if (!isProcessing) {
    isProcessing = true;
    require("./functions/updateRates")()
    .then(() => isProcessing = false)
    .catch(() => isProcessing = false);
  }
}, null, true, "Europe/London")

updateRates.start();