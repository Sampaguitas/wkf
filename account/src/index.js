const bodyParser = require("body-parser");
const passport = require("passport");
const app = require("express")();

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

app.use("/findOne", passport.authenticate("jwt", { session: false }), require("./routes/findOne"));
app.use("/login", require("./routes/login"));
app.use("/reqPwd", require("./routes/reqPwd"));
app.use("/resetPwd", require("./routes/resetPwd"));
app.use("/updatePwd", passport.authenticate("jwt", { session: false }), require("./routes/updatePwd"));
app.use("/upsert", passport.authenticate("jwt", { session: false }), require("./routes/upsert"));