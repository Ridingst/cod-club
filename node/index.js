/**
 * Module dependencies.
 */

const express = require('express')
const path = require('path');
const { type } = require('os');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const passport = require('passport');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

const port = process.env.PORT || 8080;

/**
 * Connect to MongoDB.
 */
const mongo_user = process.env.MONGO_INITDB_ROOT_USERNAME
const moongo_pass = process.env.MONGO_INITDB_ROOT_PASSWORD
const mongo_host = process.env.MONGO_HOST || 'mongodb:27017'
var mongoURL = 'mongodb://' + mongo_user + ':' + moongo_pass + '@' + mongo_host

var usernames = process.env.COD_PLAYERS.split(',')

const mongoose = require("mongoose");

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(mongoURL);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

mongoose.connect(mongoURL, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;
connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: mongoURL,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');

app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Adding middleware for some useful pug contexts
 */
app.use(function(req, res, next) {
  if(req.user && usernames.includes(req.user.battletag.split('#')[0])){
    res.locals.user = req.user;
    res.locals.valid_user = true;
  } else {
    res.locals.user = req.user;
    res.locals.valid_user = false;
  }
  next();
});

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');


/**
 * Routes start from here 
 */
app.use('/images', express.static(path.join(__dirname + '/html/static/images')))
app.use('/css', express.static(path.join(__dirname + '/html/static/css')))

/*app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/index.html'));
});*/

app.get('/players_data.js', function(req, res) {
    res.set('Cache-control', `no-store, no-cache, max-age=0`);
    res.sendFile(path.join(__dirname + '/data/players_data.js'));
});

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/last_updated', homeController.last_updated);
app.get('/players_data', homeController.player_data);
app.get('/logout', userController.logout);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/battle', passport.authenticate('bnet'));
app.get('/auth/battle/callback', passport.authenticate('bnet', { failureRedirect: '/login'}), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Final catch all instead of a 404
 */
app.get('*', (req, res) =>{res.redirect('/')});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
