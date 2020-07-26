/* eslint-disable no-console */
import dotenv from 'dotenv';
import express from 'express';
import path from 'path'; // eslint-disable-line
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fingerprint from 'express-fingerprint';
// import csrf from 'csurf';
import { signin, signup } from './contollers/authController';
import {
  checkDuplicateEmail,
  checkRolesExisted,
} from './middleware/verifySignUp';
import { jwtMiddleware } from './middleware/jwtMiddleware';
import db from './models';
import initial from './models/initial';
import { processRefreshToken } from './jwt/jwt';
import config from './contollers/config';

const Role = db.role;

dotenv.config({ silent: true });

db.mongoose
  .connect(process.env.MONGOOSE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connect to MongoDB.');
    initial(Role);
  })
  .catch((err) => {
    console.error('Connection error', err);
    process.exit();
  });

const server = express();

server.set('x-powered-by', false);
server.use(bodyParser.json({ type: '*/*', limit: '10mb' }));
server.use(
  bodyParser.urlencoded({
    limit: '10mb',
    extended: true,
    parameterLimit: 50000,
  }),
);
server.use(cookieParser());
server.use(
  fingerprint({
    parameters: [fingerprint.useragent],
  }),
);

// const corsOptions = {
//   origin: 'http://localhost:8080',
// };
// server.use(cors(corsOptions));

const corsOptions = {
  // origin: /\.your.domain\.com$/,
  origin: /localhost/,
  methods: 'GET,HEAD,POST,PATCH,DELETE,OPTIONS',
  credentials: true, // required to pass allowedHeaders:
  // "Content-Type, Authorization, X-Requested-With",
};
// intercept pre-flight check for all routes
server.options('*', cors(corsOptions));

// falta impl en cliente
// const csrfProtection = csrf({
//   cookie: true,
// });
// server.use(csrfProtection);
// server.get('/csrf-token', (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// });

const session = require('express-session');

const MongoStore = require('connect-mongo')(session);

server.use(
  session({
    secret: process.env.LOGIN_SERVER_SECRET,
    store: new MongoStore({ url: process.env.MONGOOSE }),
    saveUninitialized: true,
    resave: true,
    cookie: {
      httpOnly: false,
      secure: false,
    },
    name: 'seva',
  }),
);

server.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

// Authentication
server.post('/api/signup', [checkDuplicateEmail, checkRolesExisted], signup);
server.post('/api/signin', [cors(corsOptions)], signin);

// eslint-disable-next-line consistent-return
server.post('/refresh-token', (req, res) => {
  const refreshToken =
    req.headers.cookie
      .split(';')
      .filter((c) => c.includes('refreshToken'))[0]
      .split('=')[1] || '';
  if (!refreshToken) {
    return res.status(403).send('Access is forbidden');
  }

  processRefreshToken(refreshToken, req.fingerprint)
    .then((tokens) => {
      const cookiesOptions = {
        secure: false,
        httpOnly: false,
        domain: 'localhost',
      };
      console.log('refresh exitoso!');
      res.cookie('refreshToken', tokens.refreshToken, cookiesOptions);
      res.send({
        accessToken: tokens.accessToken,
        expiryToken: config.expiryToken,
      });
    })
    .catch((err) => {
      const message = (err && err.message) || err;
      res.status(403).send(message);
    });
});

// Authorization
server.get(
  '/api/users',
  [cors(corsOptions), jwtMiddleware],
  (req, res, _next) => {
    res.send({ seb: 'data from seb' });
  },
);

// error handler
// eslint-disable-next-line consistent-return
server.use((err, req, res, _next) => {
  if (err) {
    console.error(err.message);
    console.error(err.stack);
    return res.status(err.output.statusCode || 500).json(err.output.payload);
  }
});

export default server;
