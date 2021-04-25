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
app.use("/stocks", require("./routes/stocks"));
app.use("/users", require("./routes/users"));
app.use("/processes", require("./routes/processes"));
app.use("/imports", require("./routes/imports"));
app.use("/ping", require("./routes/ping"));

//without nginx
app.use("/server/dropdowns", require("./routes/dropdowns"));
app.use("/server/exports", require("./routes/exports"));
app.use("/server/stocks", require("./routes/stocks"));
app.use("/server/users", require("./routes/users"));
app.use("/server/processes", require("./routes/processes"));
app.use("/server/imports", require("./routes/imports"));
app.use("/server/ping", require("./routes/ping"));

let isProcessing = false;
var updateRates = new CronJob("0 0 0 * * *", function() {
  if (!isProcessing) {
    isProcessing = true;
    require("./functions/updateRates")()
    .then(() => isProcessing = false)
    .catch(() => isProcessing = false);
  }
}, null, true, "Europe/London")

var pingpong = new CronJob("0 */10 * * * *", function() {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json'},
    }
    fetch(`${process.env.REACT_APP_WK_URI}/worker/ping/`, requestOptions)
    .then( () => console.log("pong"))
    .catch( () => console.log("pong"));
}, null, true, "Europe/London");

updateRates.start();
pingpong.start();