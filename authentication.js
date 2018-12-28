var dao = require('./dao.js');

// Passport setup code
// --------------------------------------------------------------------------

// Specify that the app should use "passport" for authentication, and
// that the authentication type should be "local".
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Set up local authentication
var localStrategy = new LocalStrategy(
    function (username, password, done) {

        dao.getUser(username, function (user) {

            // If the user doesn't exist...
            if (!user) {
                return done(null, false, { message: 'Invalid user' });
            };

            // If the user's password doesn't match the typed password...
            if (user.password !== password) {
                return done(null, false, { message: 'Invalid password' });
            };

            // If we get here, everything's OK.
            done(null, user);

        });
    }
);

// This method will be called when we need to save the currently
// authenticated user's username to the session.
passport.serializeUser(function (user, done) {
    done(null, user.username);
});

// This method will be called when we need to get all the data relating
// to the user with the given username.
passport.deserializeUser(function (username, done) {
    dao.getUser(username, function (user) {
        done(null, user);
    });
});

// Set up Passport to use the given local authentication strategy
// we've defined above.
passport.use('local', localStrategy);
// --------------------------------------------------------------------------


// Passport Routes / Middleware setup
// --------------------------------------------------------------------------
var theApp;
module.exports.initialize = function (app) {

    theApp = app;

    // Start up Passport, and tell it to use sessions to store necessary data.
    app.use(passport.initialize());
    app.use(passport.session());
};

// Goes to the given place. If the place is a string, it will redirect to that route. If it's a function, it will be called.
function goTo(place, req, res) {
    if (place) {
        if (typeof (place) === 'function') {
            place(req, res);
        } else {
            res.redirect(place);
        }
    }
}

// Sets up so that when the user POSTs to the given route, they will be authenticated, and redirected based
// on whether authentication was successful.
module.exports.setupLogin = function (loginRoute, successRedirect, failureRedirect) {
    theApp.post(loginRoute, passport.authenticate('local',
        {
            successRedirect: successRedirect,
            failureRedirect: failureRedirect
        }
    ));
}

// Sets up so that when the user GETs the given route, they will be logged out, and redirected to the given route.
module.exports.setupLogout = function (logoutRoute, redirect) {
    theApp.get(logoutRoute, function (req, res) {
        req.logout();
        res.redirect(redirect);
    });
}

// When the user POSTs to the given route, go to one of two destinations, depending on whether we're logged in.
module.exports.post = function (route, funcIfAuthenticated, funcIfNotAuthenticated) {
    theApp.post(route, function (req, res) {
        if (req.isAuthenticated()) {
            goTo(funcIfAuthenticated, req, res);
        } else {
            goTo(funcIfNotAuthenticated, req, res);
        }
    });
};

// When the user GETs the given route, go to one of two destinations, depending on whether we're logged in.
module.exports.get = function (route, funcIfAuthenticated, funcIfNotAuthenticated) {
    theApp.get(route, function (req, res) {
        if (req.isAuthenticated()) {
            goTo(funcIfAuthenticated, req, res);
        } else {
            goTo(funcIfNotAuthenticated, req, res);
        }
    });
};
// --------------------------------------------------------------------------