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
app.use("/pff_type", passport.authenticate("jwt", { session: false }), require("./routes/pff_type"));
app.use("/size_one", passport.authenticate("jwt", { session: false }), require("./routes/size_one"));
app.use("/size_three", passport.authenticate("jwt", { session: false }), require("./routes/size_three"));
app.use("/size_two", passport.authenticate("jwt", { session: false }), require("./routes/size_two"));
app.use("/steel_type", passport.authenticate("jwt", { session: false }), require("./routes/steel_type"));
app.use("/surface", passport.authenticate("jwt", { session: false }), require("./routes/surface"));
app.use("/type", passport.authenticate("jwt", { session: false }), require("./routes/type"));
app.use("/wall_one", passport.authenticate("jwt", { session: false }), require("./routes/wall_one"));
app.use("/wall_two", passport.authenticate("jwt", { session: false }), require("./routes/wall_two"));

//test
app.use("/test", passport.authenticate("jwt", { session: false }), require("./routes/test"));
