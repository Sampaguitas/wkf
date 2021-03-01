const bodyParser = require("body-parser");
const app = require("express")();

app.use(require("cors")());

//bodyParser middleware
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(bodyParser.json({limit: '5mb'}));

// Connect to MongoDB
require("mongoose")
.set("useFindAndModify", false)
.connect(require("./config/keys").mongoURI,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Listen on port
const port = process.env.PORT || 5003;
app.listen(port, () => console.log(`Server running on ${port}`));

app.use("/update", require("./routes/update"));