const bodyParser = require("body-parser");
const passport = require("passport");
const app = require("express")();
const express = require("express");
const router = express.Router();

app.use(require("cors")());

//bodyParser middleware
app.use(bodyParser.urlencoded({ extended: true, limit: '13mb' }));
app.use(bodyParser.json({limit: '13mb'}));

//Passport config file
app.use(passport.initialize());
require("./config/passport")(passport);

// Connect to MongoDB
require("mongoose")
.set("useFindAndModify", false)
.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Listen on port
const port = process.env.PORT || 5002;
app.listen(port, () => console.log(`Server running on ${port}`));

app.use("/update", passport.authenticate("jwt", { session: false }), require("./routes/update"));
