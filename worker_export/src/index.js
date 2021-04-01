const mongoose = require("mongoose");
var CronJob = require("cron").CronJob
// const genParams = require("./functions/genParams")
// const genStocks = require("./functions/genStocks")

// Connect to MongoDB
mongoose
.set("useFindAndModify", false)
.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

let isProcessing = false;

var generateFile = new CronJob("* * * * * *", function() {
    if (!isProcessing) {
      isProcessing = true;
      require("./functions/processFindOne")().then(res => {
        switch(res.type) {
            case "stocks": require("./functions/genStocks")().then( () => isProcessing = false);
            break;
          default: require("./functions/genParams")().then( () => isProcessing = false);
        }
      }).catch( () => isProcessing = false);
    }
}, null, true, "Europe/London")

generateFile.start();