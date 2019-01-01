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
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';


// require formidable for handling audio/video uploads
var formidable = require("formidable");

//import external DAO module which contains the database access statements
var dao = require('./dao.js');

// Custom module for authentication stuff
// var auth = require('./authentication.js');
// auth.initialize(app);
// auth.setupLogin("/login", "/orderHistory", "/login?loginFail=true");
// auth.setupLogout("/logout", "/animals?loggedOut=true");

//--------------------- ROUTE HANDLERS -------------------------------------------

app.get('/', function (req, res) {

    res.render('home');
});

app.get('/signup', function (req, res) {

    var data = {
        passwordFail: req.query.passwordFail,
        userData: req.session.partialUserData,
    }

    res.render('signup', data);
});

app.post('/signup', function (req, res) {
    if (req.body.password != req.body.passwordCheck) {
        req.session.partialUserData = {
            fname: req.body.fname,
            lname: req.body.lname,
            username: req.body.username
        }
        res.redirect('/signup?passwordFail=true');
    } else {
        delete req.session.partialUserData;

        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            var newUser = {
                fname: req.body.fname,
                lname: req.body.lname,
                username: req.body.username,
                password: hash,
                activeFlag: req.body.activeFlag
            }
            dao.createUser(newUser, function (err, user) {
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/');

                });

            });
        });
    }
});

// Serve files form "/public" folder
app.use(express.static(__dirname + "/public"));

// --------------------------------------------------------------------------

// 404 page
app.use(function (req, res) {
    res.type('text/html');
    res.status(404);
    res.send('Page not found. <a href="/">Click here</a> to return to the homepage.');
});

// 500 page
app.use(function (req, res) {
    res.type('text/html');
    res.status(500);
    res.send("500 Internal Server Error. <a href=" / ">Click here</a> to return to the homepage.");
});

// Start the server running.
app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port'));
});