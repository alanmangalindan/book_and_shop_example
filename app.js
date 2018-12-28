// Set up express
var express = require('express');

var app = express();

// Listen on port 3000
app.set('port', process.env.PORT || 3000);

// Set up handlebars
var handlebars = require('express-handlebars');
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Set up body parser for reading submitted form data
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Set up cookie parser
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// Set up sessions
var session = require('express-session');
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "aSampleWebsiteWithBookingAndShopping"
}));

// Set up password hashing
var scrypt = require("scrypt");
var scryptParameters = scrypt.paramsSync(0.1);
var key = new Buffer("myPassword"); //could also be a string

var kdfResult = scrypt.kdfSync(key, scryptParameters);

//Synchronous
scrypt.verifyKdfSync(kdfResult, key); // returns true
scrypt.verifyKdfSync(kdfResult, "incorrect password"); // returns false

// require formidable for handling audio/video uploads
var formidable = require("formidable");

//import external DAO module which contains the database access statements
var dao = require('./dao.js');

// Custom module for authentication stuff
var auth = require('./authentication.js');
auth.initialize(app);
auth.setupLogin("/login", "/orderHistory", "/login?loginFail=true");
auth.setupLogout("/logout", "/animals?loggedOut=true");