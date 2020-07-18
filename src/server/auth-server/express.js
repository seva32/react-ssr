/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
/* eslint-disable no-console */
const dotenv = require('dotenv');
const express = require('express');
const path = require('path'); // eslint-disable-line
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const passport = require('passport');
const { signup, signin } = require('./contollers/authentications');
const passport = require('./middleware/passport').default; // eslint-disable-line
// const { authenticationMiddleware } = require('./middleware/authentication');
// const auth1 = require('./middleware/auth1');

// const authList = ['/posts'];
dotenv.config({ silent: true });

mongoose.connect(process.env.MONGOOSE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const requireSignin = passport.authenticate('local', {
  session: false,
  failWithError: true,
});

// prettier-ignore
// const requireSignin = (req, res, next) => passport.authenticate(
//   'local',
//   {
//     session: true,
//     failWithError: true,
//   },
//   (err, user, info) => {
//     // If authentication failed, `user` will be set to false.
//     // If an exception occurred, `err` will be set.
//     if (err || !user || user === undefined) {
//       // PASS THE ERROR OBJECT TO THE NEXT ROUTE i.e THE APP'S COMMON ERROR HANDLING MIDDLEWARE
//       return next(info);
//     }
//     return next();
//   },
// )(req, res, next);

// const authenticationMiddleware = (authList = []) => (req, res, next) => {
//   const check = authList.find((el) => el === req.baseUrl);
//   if (check) {
//     if (req.isAuthenticated()) {
//       return next();
//     }
//     return res.redirect('/');
//   }
//   return next();
// };

const server = express();

server.set('x-powered-by', false);
// server.use(bodyParser.json({ type: '*/*' }));
server.use(express.json());
// server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(cors());

// express-session para passport.session (aqui local es session: false)
// const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);
// server.use(
//   session({
//     secret: process.env.LOGIN_SERVER_SECRET,
//     store: new MongoStore({ mongooseConnection: mongoose.connection }),
//     saveUninitialized: true,
//     resave: true,
//     cookie: {
//       httpOnly: false,
//       secure: false,
//     },
//   }),
// );

// server.get('/api/auth', (req, res, next) => {
//   req.session.user = 'Seb'; // los otros middle puede usar el objeto session
//   next();
// });

// server.get('/cookie', (req, res) => {
//   const options = {
//     secure: false,
//     httpOnly: false,
//     domain: '.your.domain.com',
//   };
//   if (!req.isAuthenticated()) {
//     return res.status(400).send('Unauthorized');
//   }
//   return res
//     .cookie('Secure', 'Secure', options)
//     .status(200)
//     .send('cookie sent');
// });

server.post('/api/signup', signup);
server.post('/api/signin', requireSignin, signin);

server.use('/posts', requireSignin, (req, res, next) => {
  next();
});
// server.use('*', (req, res, next) => {
//   const check = authList.find((el) => el === req.baseUrl);
//   if (check) {
//     if (req.isAuthenticated()) {
//       console.log('auth');
//       return next();
//     }
//     console.log('unauth');
//     return res.redirect('/');
//   }
//   return next();
// });

server.use((err, req, res, next) => {
  let responseStatusCode = 500;
  const responseObj = {
    success: false,
    data: [],
    error: err,
    message: 'There was some internal server error',
  };

  // IF THERE WAS SOME ERROR THROWN BY PREVIOUS REQUEST
  if (err) {
    // IF THE ERROR IS REALTED TO JWT AUTHENTICATE, SET STATUS
    // CODE TO 401 AND SET A CUSTOM MESSAGE FOR UNAUTHORIZED
    if (err.name === 'JsonWebTokenError') {
      responseStatusCode = 401;
      responseObj.message =
        'You are not authorized to access this protected resource';
    }
  }

  if (!res.headersSent) {
    res.status(responseStatusCode).json(responseObj);
  }
});

module.exports = server;
