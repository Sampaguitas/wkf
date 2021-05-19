const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

module.exports = passport => {
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET
    }, (jwt_payload, done) => done(null, jwt_payload)));
};

// module.exports = passport => {
//     passport.use(new JwtStrategy({
//         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//         secretOrKey: process.env.SECRET
//     }, (jwt_payload, done) => {
//         require("../models/User").findById(jwt_payload._id, function(err, user) {
//             if (err || !user) {
//                 return done(null, false);
//             } else {
//                 console.log(user);
//                 return done(null, user);
//             }
//         });
//     }));
// };
