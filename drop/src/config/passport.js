const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

module.exports = passport => {
    passport.use(new JwtStrategy({
        "jwtFromRequest": ExtractJwt.fromAuthHeaderAsBearerToken(),
        "secretOrKey": require("./keys").secret
    }, (jwt_payload, done) => done(null, jwt_payload)));
};