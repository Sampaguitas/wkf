const bodyParser = require("body-parser");
const passport = require("passport");
const app = require("express")();
var CronJob = require('cron').CronJob;

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