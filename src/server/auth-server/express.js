/* eslint-disable no-console */
const dotenv = require('dotenv');
const express = require('express');
const path = require('path'); // eslint-disable-line
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
// const User = require('./models/user');

// const passportConfig = require('passport');
const { signup, signin } = require('./contollers/authentications');
const passportConfig = require('./passport2'); // eslint-disable-line

dotenv.config({ silent: true });

mongoose.connect(process.env.MONGOOSE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const requireSignin = (req, res, next) => {
  passportConfig.authenticate(
    'local',
    // {
    //   session: false,
    //   successRedirect: '/',
    //   failureRedirect: '/signin',
    //   successFlash: 'Welcome!',
    //   failureFlash: 'Invalid username or password.',
    // },
    // eslint-disable-next-line consistent-return
    (error, user, _info) => {
      if (error) {
        return next(error);
      }
      if (!user) {
        return res.redirect('/signin');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
    },
  )(req, res, next);
};

const server = express();

server.set('x-powered-by', false);
server.use(bodyParser.json({ type: '*/*' }));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(flash());
server.use(cors());

// express-session para passport.session (aqui local es session: false)

server.use(
  session({
    secret: process.env.LOGIN_SERVER_SECRET,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    saveUninitialized: true,
    resave: false,
    cookie: {
      httpOnly: false,
      secure: false,
    },
  }),
);

server.use(passportConfig.initialize());
server.use(passportConfig.session());

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

module.exports = server;
