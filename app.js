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

// require formidable for handling audio/video uploads
var formidable = require("formidable");

//import external DAO module which contains the database access statements
var dao = require('./dao.js');

// Custom module which handles shopping cart updates
var shoppingCart = require('./shoppingCart.js');

// Custom module for authentication
var auth = require('./authentication.js');
auth.initialize(app);
auth.setupLogin("/login", "/", "/login?loginFail=true");
auth.setupLogout("/logout", "/?loggedOut=true");
auth.setupGoogleLogin('/auth/google');
auth.setupGoogleLoginCallback('/auth/google/callback');
auth.setupTwitterLogin('/auth/twitter');
auth.setupTwitterLoginCallback('/auth/twitter/callback');
// Facebook login not yet working
// auth.setupFacebookLogin('/auth/facebook');
// auth.setupFacebookLoginCallback('/auth/facebook/callback');

//--------------------- ROUTE HANDLERS -------------------------------------------

// home page
app.get('/', function (req, res) {

    if (req.isAuthenticated()) {

        dao.getUser(req.user.username, function (user) {
            var data = {
                userData: user,
                accountUpdated: req.query.accountUpdated
            }
            res.render('home', data);
        });

    } else {

        var data = {
            loggedOut: req.query.loggedOut,
            accountUpdated: req.query.accountUpdated,
            userDeleted: req.query.userDeleted
        }

        res.render('home', data);
    }
});

// sign up page
app.get('/signup', function (req, res) {

    var data = {
        passwordFail: req.query.passwordFail,
        userData: req.session.partialUserData,
        usernameExists: req.query.usernameExists
    };

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

        auth.bcryptAuth.hash(req.body.password, auth.saltRoundsAuth, function (err, hash) {
            var newUser = {
                fname: req.body.fname,
                lname: req.body.lname,
                username: req.body.username,
                password: hash,
                activeFlag: req.body.activeFlag
            }
            dao.createUser(newUser, function (err, user) {
                if (err) {
                    req.session.partialUserData = {
                        fname: req.body.fname,
                        lname: req.body.lname,
                        username: req.body.username
                    }
                    res.redirect('/signup?usernameExists=true');
                } else {
                    delete req.session.partialUserData;
                    auth.passportAuth.authenticate('local')(req, res, function () {
                        res.redirect('/');
                    });
                }
            });
        });
    }
});

// login page
auth.get('/login', '/', function (req, res) {
    var data = {
        loginFail: req.query.loginFail,
        loginFirst: req.query.loginFirst
    }
    res.render('login', data);
});


// edit user details page
auth.get('/userDetails', function (req, res) {

    dao.getUser(req.user.username, function (user) {
        var data = {
            userData: user
        }
        res.render('userDetails', data);
    });
}, '/login?loginFirst=true');

// update user details
auth.post('/updateUser', function (req, res) {

    var user = {
        fname: req.body.fname,
        lname: req.body.lname,
        activeFlag: req.body.activeFlag,
        username: req.user.username
    }

    dao.updateUser(user, function () {
        res.redirect('/?accountUpdated=true');
    });

}, '/login?loginFirst=true');

// set user as inactive = delete User
app.post('/deleteUser', function (req, res) {

    dao.deleteUser(req.user.username, function () {
        req.logout();
        res.redirect("/?userDeleted=true");
    });

});

// booking page
auth.get('/book', function (req, res) {

    dao.getAllProfessionals(function (professionals) {

        dao.getTimeSelection(function (timeSelection) {

            dao.getBookingsForUser(req.user.username, function (userBookings) {
                var data = {
                    prof: professionals,
                    timeSelection: timeSelection,
                    userBookings: userBookings,
                    userData: req.user,
                    bookingCreated: req.query.bookingCreated,
                    notesUpdated: req.query.notesUpdated,
                    bookingDeleted: req.query.bookingDeleted
                }
                res.render('book', data);
            });
        });
    });

}, '/login?loginFirst=true');

// submit booking and write to database
auth.post('/book', function (req, res) {

    var newBooking = {
        bookedBy: req.user.username,
        profId: req.body.profId,
        bookingDate: req.body.date,
        bookingTime: req.body.time,
        location: req.body.location,
        notes: req.body.notes
    }

    dao.createBooking(newBooking, function () {
        res.redirect('/book?bookingCreated=true');
    })

}, '/login?loginFirst=true')


// ajax call to display professional's details when selected from drop down
auth.get('/getProfDetails/:id', function (req, res) {
    dao.getProfDetails(req.params.id, function (profDetails) {
        res.status(200);
        res.type("text/plain");
        res.end(JSON.stringify(profDetails));
    });
}, '/login?loginFirst=true');

// ajax call to display professional's bookings when selected from drop down
auth.get('/getProfBookings/:id', function (req, res) {
    dao.getProfBookings(req.params.id, function (profBookings) {
        res.status(200);
        res.type("text/plain");
        res.end(JSON.stringify(profBookings));
    });
}, '/login?loginFirst=true');

// update booking notes
auth.post('/updateNotes', function (req, res) {
    var bookingUpdate = {
        bookingId: req.body.bookingId,
        notes: req.body.updatedNotes
    }
    dao.updateNotes(bookingUpdate, function () {
        res.redirect('/book?notesUpdated=true');
    });
}, '/login?loginFirst=true');

// delete booking
auth.post('/deleteBooking', function (req, res) {
    dao.deleteBooking(req.body.bookingId, function () {
        res.redirect('/book?bookingDeleted=true');
    });
}, '/login?loginFirst=true');

auth.get('/shop', function (req, res) {

    var cart = shoppingCart.getCart(req);

    dao.getAllMedSupplies(function (medSupplies) {

        dao.getShoppingCartDetails(cart, function (cartDetails) {
            var data = {
                thisPage: "/shop",
                userData: req.user,
                medSupplies: medSupplies,
                cartMessage: req.query.cartMessage,
                cart: cartDetails,
                layout: "withShopCart"
            }
            res.render("shop", data);

        });

    });

}, '/login?loginFirst=true');

// add to cart functionality
auth.post('/addToCart', function (req, res) {
    // Get submitted form data
    var num = parseInt(req.body.amount);
    var medSupplyId = parseInt(req.body.medSupplyId);

    if (num > 0) {
        shoppingCart.addItemToCart(req, res, medSupplyId, num);
    }

    res.redirect("/shop?cartMessage=You added " + num + " items to your cart.");

}, '/login?loginFirst=true');

// update cart functionality
auth.post('/updateCart', function (req, res) {

    // Update it according to the submitted form data
    var cartUpdateInfo = [];
    for (var inputName in req.body) {
        if (inputName.substring(0, 6) == "count-") {
            var itemId = parseInt(inputName.substring(6));
            var newCount = parseInt(req.body[inputName]);
            cartUpdateInfo.push({
                itemId: itemId,
                count: newCount
            });
        }
    }

    // Update the cart itself
    shoppingCart.setNumItemsInCart(req, res, cartUpdateInfo);

    // Redirect to wherever the user just came from
    res.redirect(req.body.thisPage + "?cartMessage=You have successfully updated your cart.");

}, '/login?loginFirst=true');

// clear cart contents functionality
auth.post('/clearCart', function (req, res) {

    shoppingCart.clearCart(req, res);

    // Redirect to wherever the user just came from
    res.redirect(req.body.thisPage + "?cartMessage=You successfully cleared your cart.");
    
}, '/login?loginFirst=true');

// route to order history page
auth.get('/orderHistory', function (req, res) {

    var cart = shoppingCart.getCart(req);

    dao.getOrderHistoryFor(req.user.username, function (orderHistory) {

        dao.getShoppingCartDetails(cart, function (cartDetails) {
            var data = {
                thisPage: "/orderHistory",
                orderHistoryPage: true,
                orderSuccess: req.query.orderSuccess,
                cart: cartDetails,
                username: req.user.username,
                orders: orderHistory,
                userData: req.user,
                layout: "withShopCart"
            };

            res.render("orderHistory", data);
        });

    });

}, '/login?loginFirst=true');

// route to order checkout page
auth.get("/checkout", function (req, res) {

    var cart = shoppingCart.getCart(req);

    dao.getNewOrderDetails(cart, function (newOrder) {
        var data = {
            thisPage: "/checkout",
            checkoutPage: true,
            cart: newOrder.orderDetails,
            username: req.user.username,
            order: newOrder,
            layout: "withShopCart"
        };

        res.render("checkout", data);
    });
}, '/login?loginFirst=true');

auth.post("/checkout", function (req, res) {

    var cart = shoppingCart.getCart(req);

    dao.getNewOrderDetails(cart, function (newOrder) {
        dao.saveOrder(newOrder, req.user.username, function () {

            shoppingCart.clearCart(req, res);

            // Redirect to order history page.
            res.redirect("/orderHistory?orderSuccess=true");
        });
    });

}, '/login?loginFirst=true');


// Serve files from "/public" folder
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