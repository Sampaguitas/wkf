const mongoose = require("mongoose");
var CronJob = require("cron").CronJob

mongoose
.set("useFindAndModify", false)
.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

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

generateFile.start();