const mongoose = require("mongoose");
var CronJob = require("cron").CronJob

mongoose
.set("useFindAndModify", false)
.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

let isProcessing = false;

var generateFile = new CronJob("*/10 * * * * *", function() {
    if (!isProcessing) {
      isProcessing = true;
      require("./functions/processFindOne")().then(res => {
        switch(res.type) {
            case "stocks": require("./functions/genStocks")(res).then( () => isProcessing = false);
            break;
            case "params": require("./functions/genParams")(res).then( () => isProcessing = false);
            break;
          default: require("./functions/processReject")(res._id).then( () => isProcessing = false);
        }
      }).catch( () => isProcessing = false);
    }
}, null, true, "Europe/London");

generateFile.start();