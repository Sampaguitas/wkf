const userController = require("../controllers");
const passport = require("passport");

const routes = app => {
    app.post("/getAll", passport.authenticate("jwt", { session: false }), userController.getAll);
    app.get("/:userId", passport.authenticate("jwt", { session: false }), userController.getById);
    app.post("/login", userController.login);
    app.post("/reqPwd", userController.reqPwd);
    app.put("/resetPwd/:userId", userController.resetPwd);
    app.put("/updatePwd", passport.authenticate("jwt", { session: false }), userController.updatePwd);
    app.post("/", passport.authenticate("jwt", { session: false }), userController.create);
    app.put("/:userId", passport.authenticate("jwt", { session: false }), userController.update);
    app.put("/setAdmin/:userId", passport.authenticate("jwt", { session: false }), userController.setAdmin);
    app.delete("/:userId", passport.authenticate("jwt", { session: false }), userController._delete);
}

module.exports = routes;
