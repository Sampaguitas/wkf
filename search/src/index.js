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

app.use("/article", passport.authenticate("jwt", { session: false }), require("./routes/article"));
app.use("/stocks", passport.authenticate("jwt", { session: false }), require("./routes/stocks"));
app.use("/users", passport.authenticate("jwt", { session: false }), require("./routes/users"));