const express = require("express");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const _ = require("lodash");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const keys = require("./config/keys");

const app = express();

app.use(cors());

//bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Passport config file
app.use(passport.initialize());
require("./models/index");
require("./config/passport")(passport);

// Connect to MongoDB
mongoose
.connect(keys.mongoURI,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Listen on port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));

app.use("/login", require("./routes/login"));
