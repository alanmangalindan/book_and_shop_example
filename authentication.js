var dao = require('./dao.js');

// Set up password hashing
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
            }

            var retrievedHash = user.password;

            bcrypt.compare(password, retrievedHash, function (err, res) {

                // If the user's password doesn't match the typed password...
                if (!res) {
                    return done(null, false, { message: 'Invalid password' });
                } else {

                    // If we get here, the user can be logged in.
                    done(null, user);
                }
            });

        });
    }
);

// Set up Passport to use the given local authentication strategy
// we've defined above.
passport.use('local', localStrategy);

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

// add oauth.js
var config = require('./oauth.js');

// Google and Twitter authentication codes adapted from https://mherman.org/blog/social-authentication-with-passport-dot-js/
// add Google OAuth2 authentication Strategy
var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        dao.getUser(profile.email, function (user) {
            if (user !== null) {
                done(null, user);
            } else {

                // generate random password from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
                var randomPassword = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

                for (var i = 0; i < 8; i++)
                    randomPassword += possible.charAt(Math.floor(Math.random() * possible.length));

                bcrypt.hash(randomPassword, saltRounds, function (err, hash) {
                    var newUserWithGoogleAuth = {
                        fname: profile.name.givenName,
                        lname: profile.name.familyName,
                        username: profile.email,
                        password: hash,
                        activeFlag: 1
                    }
                    dao.createUser(newUserWithGoogleAuth, function (err, newUserLogsIn) {
                        done(null, newUserLogsIn);
                    });
                });
            }
        });
    }
));

// add Twitter OAuth2 authentication Strategy
var TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackURL
},
    function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        var appUsername = profile.id + "@fromTwitterAccount.co.nz";
        dao.getUser(appUsername, function (user) {
            if (user !== null) {
                done(null, user);
            } else {

                // generate random password from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
                var randomPassword = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

                for (var i = 0; i < 8; i++)
                    randomPassword += possible.charAt(Math.floor(Math.random() * possible.length));

                bcrypt.hash(randomPassword, saltRounds, function (err, hash) {
                    var newUserWithTwitterAuth = {
                        fname: profile.username,
                        lname: 'twitter',
                        username: appUsername,
                        password: hash,
                        activeFlag: 1
                    }
                    dao.createUser(newUserWithTwitterAuth, function (err, newUserLogsIn) {
                        done(null, newUserLogsIn);
                    });
                });
            }
        });
    }
));

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

// Set up Google and twitter Auths routes (from https://mherman.org/blog/social-authentication-with-passport-dot-js/)
module.exports.setupGoogleLogin = function (loginRoute) {
    theApp.get(loginRoute,
        passport.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/plus.login',
                'https://www.googleapis.com/auth/plus.profile.emails.read'
            ]
        }
        ));
}
module.exports.setupGoogleLoginCallback = function (loginCallbackRoute) {
    theApp.get(loginCallbackRoute,
        passport.authenticate('google', { failureRedirect: '/' }),
        function (req, res) {
            res.redirect('/');
        });
}
module.exports.setupTwitterLogin = function (loginRoute) {
    theApp.get(loginRoute,
        passport.authenticate('twitter'),
        function (req, res) { });
}

module.exports.setupTwitterLoginCallback = function (loginCallbackRoute) {
    theApp.get(loginCallbackRoute,
        passport.authenticate('twitter', { failureRedirect: '/' }),
        function (req, res) {
            res.redirect('/');
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

