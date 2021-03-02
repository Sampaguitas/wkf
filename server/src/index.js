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
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));

//user
app.use("/user/login", require("./routes/user/login"));

//dropdown
app.use("/dropdown/currency", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/currency"));
app.use("/dropdown/end", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/end"));
app.use("/dropdown/grade", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/grade"));
app.use("/dropdown/length", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/length"));
app.use("/dropdown/pffType", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/pffType"));
app.use("/dropdown/sizeOne", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/sizeOne"));
app.use("/dropdown/sizeThree", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/sizeThree"));
app.use("/dropdown/sizeTwo", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/sizeTwo"));
app.use("/dropdown/steelType", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/steelType"));
app.use("/dropdown/surface", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/surface"));
app.use("/dropdown/type", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/type"));
app.use("/dropdown/wallOne", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/wallOne"));
app.use("/dropdown/wallTwo", passport.authenticate("jwt", { session: false }), require("./routes/dropdown/wallTwo"));