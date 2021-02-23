const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

module.exports = passport => {
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: require("./keys").secret
    }, (jwt_payload, done) => {
        require("../models/User").findById(jwt_payload.id, function(err, user) {
            if (err || !user) {
                return done(null, false);
            } else {
                return done(null, user);
            }
        });
    }));
};