const bodyParser = require("body-parser");
const passport = require("passport");
const app = require("express")();

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
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on ${port}`));

//dropdown
app.use("/currency", passport.authenticate("jwt", { session: false }), require("./routes/currency"));
app.use("/end", passport.authenticate("jwt", { session: false }), require("./routes/end"));
app.use("/grade", passport.authenticate("jwt", { session: false }), require("./routes/grade"));
app.use("/length", passport.authenticate("jwt", { session: false }), require("./routes/length"));
app.use("/pffType", passport.authenticate("jwt", { session: false }), require("./routes/pffType"));
app.use("/sizeOne", passport.authenticate("jwt", { session: false }), require("./routes/sizeOne"));
app.use("/sizeThree", passport.authenticate("jwt", { session: false }), require("./routes/sizeThree"));
app.use("/sizeTwo", passport.authenticate("jwt", { session: false }), require("./routes/sizeTwo"));
app.use("/steelType", passport.authenticate("jwt", { session: false }), require("./routes/steelType"));
app.use("/surface", passport.authenticate("jwt", { session: false }), require("./routes/surface"));
app.use("/type", passport.authenticate("jwt", { session: false }), require("./routes/type"));
app.use("/wallOne", passport.authenticate("jwt", { session: false }), require("./routes/wallOne"));
app.use("/wallTwo", passport.authenticate("jwt", { session: false }), require("./routes/wallTwo"));