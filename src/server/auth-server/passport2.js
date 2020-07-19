const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user').default;

passport.serializeUser((user, done) => {
  done(null, user._id); // eslint-disable-line
  // if you use Model.id as your idAttribute maybe you'd want
  // done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // eslint-disable-next-line consistent-return
    User.findOne({ email }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      user.comparePassword(password, (error, isMatch) => {
        if (error) {
          return done(error);
        }
        if (!isMatch) {
          return done(null, false);
        }
        return done(null, user);
      });
    });
  }),
);

module.exports = passport;
