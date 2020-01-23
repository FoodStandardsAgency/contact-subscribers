const path 		= require('path');
const express 	= require('express');
const session	= require('client-sessions');
const nunjucks  = require('nunjucks');
const morgan = require('morgan');
const formidableMiddleware = require('express-formidable');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 7000;
const dev = process.env.NODE_ENV !== 'production';

app.use(express.urlencoded({extended: true}));

app.use(formidableMiddleware({
  encoding: 'utf-8',
  uploadDir: 'tmp',
  multiples: false, // req.files to be arrays of files
  keepExtensions: true,
  type: 'multipart'
}));

app.use(session({
  cookieName: 'session',
  secret: process.env.COOKIE_SECRET,
  duration: 180 * 60 * 1000, // 180 min
  activeDuration: 180 * 60 * 1000, // 180 min
  maxAge: 8*60*60*1000, // 8 hour
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

// Views & Nunjucks
app.set('view engine', 'html');
nunjucks.configure(__dirname + '/app/views', {
    autoescape: true,
	trimBlocks: true, 
	lstripBlocks: true, 
	watch: true,
    express: app
});

app.use(morgan('dev'));

if (dev) {
  var chokidar = require('chokidar');
  chokidar.watch('./app', {ignoreInitial: true}).on('all', (event, path) => {
    console.log("Clearing /app/ module cache from server");
    Object.keys(require.cache).forEach(function(id) {
      if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id];
    });
  });
}

// Middleware to serve static assets
[
  '/public',
  '/app/assets',
].forEach((folder) => {
  app.use('/public', express.static(path.join(__dirname, folder)));
});

// send assetPath to all views
app.use(function (req, res, next) {
  res.locals.asset_path = "/public/";
  next();
});


// Router
app.use("/", function(req, res, next) {
  require('./app/routes.js')(req, res, next);
});

// start the app
app.listen(port, () => {
  console.log('Listening on port ' + port);
});

