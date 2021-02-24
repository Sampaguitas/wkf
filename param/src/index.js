const bodyParser = require("body-parser");
const passport = require("passport");
const app = require("express")();
const express = require("express");
const router = express.Router();

app.use(require("cors")());

//bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Passport config file
app.use(passport.initialize());
require("./config/passport")(passport);

// Connect to MongoDB
require("mongoose")
.set("useFindAndModify", false)
.connect(require("./config/keys").mongoURI,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Listen on port
const port = process.env.PORT || 5002;
app.listen(port, () => console.log(`Server running on ${port}`));

app.use("/generate", passport.authenticate("jwt", { session: false }), require("./routes/generate"));
