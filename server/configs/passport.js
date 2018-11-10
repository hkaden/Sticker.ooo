const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = mongoose.model('User');
const passportJWT = require('passport-jwt');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;


/*
 * First Login
 */
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
}, ((email, password, done) => {
  User.findOne({ email })
    .then((user) => {
      if (!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'username or password': 'is invalid' } });
      }
      return done(null, user);
    }).catch(done);
})));

/*
 * Authenticate with JWT
 */
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}, ((jwtPayload, done) => {
  User.findOne({ username: jwtPayload.username }, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  });
})));
