const express = require('express');

const router = express.Router();
const passport = require('passport');

router.all('*', (req, res, next) => {
  passport.authenticate(
    'local',
    {
      session: false,
      failWithError: true,
    },
    (err, user, info) => {
      // If authentication failed, `user` will be set to false.
      // If an exception occurred, `err` will be set.
      if (err || !user) {
        // PASS THE ERROR OBJECT TO THE NEXT ROUTE i.e THE APP'S COMMON ERROR HANDLING MIDDLEWARE
        return next(info);
      }
      return next();
    },
  )(req, res, next);
});

module.exports = router;
