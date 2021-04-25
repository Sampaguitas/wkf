const bodyParser = require("body-parser");
const passport = require("passport");
const app = require("express")();
var CronJob = require("cron").CronJob
app.use(require("cors")());
const fetch = require("node-fetch");

//bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Passport config file
app.use(passport.initialize());
require("./models/index.js");
require("./config/passport")(passport);

require("mongoose")
.set("useFindAndModify", false)
.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Listen on port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));

app.get("/ping", (req, res, next) => {
  res.status(200).json({ message: "pong"});
});

//without nginx
app.get("/worker/ping", (req, res, next) => {
  res.status(200).json({ message: "pong"});
});

let isProcessing = false;

// var generateFile = new CronJob("*/10 * * * * *", function() {
//     if (!isProcessing) {
//       isProcessing = true;
//       require("./functions/exportFindOne")().then(res => {
//         switch(res.type) {
//             case "stocks": require("./functions/exportStocks")(res).then( () => isProcessing = false);
//             break;
//             case "params": require("./functions/exportParams")(res).then( () => isProcessing = false);
//             break;
//           default: require("./functions/exportReject")(res._id).then( () => isProcessing = false);
//         }
//       }).catch( () => isProcessing = false);
//     }
// }, null, true, "Europe/London");

var generateFile = new CronJob("*/10 * * * * *", function() {
  if (!isProcessing) {
    isProcessing = true;
    require("./functions/exportFindOne")().then(res => {
      switch(res.type) {
          case "stocks": require("./functions/exportStocks")(res).then( () => processImports().then( () => isProcessing = false));
          break;
          case "params": require("./functions/exportParams")(res).then( () => processImports().then( () => isProcessing = false));
          break;
        default: require("./functions/exportReject")(res._id).then( () => processImports().then( () => isProcessing = false));
      }
    }).catch( () => processImports().then( () => isProcessing = false));
  }
}, null, true, "Europe/London");

function processImports() {
  return new Promise(function(resolve) {
    require("./functions/importFindOne")().then(res => {
      switch(res.type) {
          case "stocks": require("./functions/importStocks")(res).then( () => resolve());
          break;
          case "params": require("./functions/importParams")(res).then( () => resolve());
          break;
        default: require("./functions/importReject")(res._id).then( () => resolve());
      }
    }).catch( () => resolve());
  });
}

var pingpong = new CronJob("0 */10 * * * *", function() {
  const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json'},
  }
  fetch(`${process.env.REACT_APP_API_URI}/server/ping/`, requestOptions)
  .then( () => console.log("pong"));
}, null, true, "Europe/London");

generateFile.start();
pingpong.start();