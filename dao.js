// separate file for database access functions

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('book_and_shop.db');

// enable foreign keys on the database which is not enabled by default
db.get("PRAGMA foreign_keys = ON");

// allows us to create a nice looking date and time
var dateTime = require('node-datetime');

//----------------------Queries relating to Accounts---------------------------
module.exports.getUser = function (username, callback) {

    db.all("select * from Users where username = ?", [username], function (err, rows) {
        if (rows.length > 0) {
            //only return active users
            if (rows[0].activeFlag == 1) {
                callback(rows[0]);
            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
}

module.exports.createUser = function (u, callback) {
    db.run("insert into Users (username, password, fname, lname, activeFlag) values (?, ?, ?, ?, ?)", [u.username, u.password, u.fname, u.lname, u.activeFlag], function (err) {
        if (err) {
            console.log(err);
        }
        console.log(this.changes + " row(s) added in Users table.");
        callback(err, u);
    });

}

module.exports.updateUser = function (u, callback) {
    db.run("update Users set fname = ?, lname = ?, activeFlag = ? where username = ?", [u.fname, u.lname, u.activeFlag, u.username], function (err) {
        if (err) {
            console.log(err);
        }
        console.log(this.changes + " row(s) affected in Users table.");
        callback();
    });

}

//----------------------Queries relating to Professionals---------------------------
module.exports.getAllProfessionals = function (callback) {
    db.all("select * from Professionals", function (err, rows) {
        if (rows.length > 0) {
            console.log(rows.length + " row(s) retrieved from Professionals table.");
            callback(rows);
        } else {
            console.log(rows.length + " row(s) retrieved from Professionals table.");
            callback(null);
        }
    });
}

module.exports.getProfDetails = function (id, callback) {
    db.all("select * from Professionals where profId = ?", [id], function (err, rows) {
        if (rows.length > 0) {
            console.log(rows.length + " row(s) retrieved from Professionals table.");
            callback(rows[0]);
        } else {
            console.log(rows.length + " row(s) retrieved from Professionals table.");
            callback(null);
        }
    });
}

module.exports.deleteUser = function (username, callback) {
    db.run("update Users set activeFlag = 0 where username = ?", [username], function (err) {
        if (err) {
            console.log(err);
        }
        console.log(this.changes + " row(s) affected in Users table.");
        callback();
    });
}

//----------------------Queries relating to Bookings---------------------------
module.exports.getTimeSelection = function (callback) {
    db.all("select * from TimeSelection", function (err, rows) {
        if (rows.length > 0) {
            console.log(rows.length + " row(s) retrieved from TimeSelection table.");
            callback(rows);
        } else {
            console.log(rows.length + " row(s) retrieved from TimeSelection table.");
            callback(null);
        }
    });
}

module.exports.createBooking = function (booking, callback) {
    db.run("insert into Bookings (bookedBy, profId, bookingDate, bookingTime, location, notes) values (?, ?, ?, ?, ?, ?)",
        [booking.bookedBy, booking.profId, booking.bookingDate, booking.bookingTime, booking.location, booking.notes], function (err) {
            if (err) {
                console.log(err);
            }

            console.log(this.changes + " row(s) inserted in Bookings table.");

            callback();
        });
}

module.exports.getBookingsForUser = function (username, callback) {
    db.all("select b.bookingId, b.bookedBy, b.profId, p.fname, p.lname, b.bookingDate, b.bookingTime, b.location, b.notes from Bookings b, Professionals p where b.profId = p.profId and bookedBy = ? order by b.bookingDate, b.bookingTime asc", [username], function (err, rows) {
        if (err) {
            console.log(err);
        }
        callback(rows);
    });
}

module.exports.getProfBookings = function (profId, callback) {
    db.all("select b.bookingId, b.bookedBy, b.profId, p.fname, p.lname, b.bookingDate, b.bookingTime, b.location, b.notes from Bookings b, Professionals p where b.profId = p.profId and b.profId = ? order by b.bookingDate, b.bookingTime asc", [profId], function (err, rows) {
        if (err) {
            console.log(err);
        }
        callback(rows);
    });
}

module.exports.updateNotes = function (bookingUpdate, callback) {
    db.run("update Bookings set notes = ? where bookingId = ?", [bookingUpdate.notes, bookingUpdate.bookingId], function (err) {
        if (err) {
            console.log(err);
        }
        console.log(this.changes + " row(s) affected in Bookings table.");
        callback();
    });
}

module.exports.deleteBooking = function (bookingId, callback) {
    db.run("delete from Bookings where bookingId = ?", [bookingId], function (err) {
        if (err) {
            console.log(err);
        }
        console.log(this.changes + " row(s) affected in Bookings table.");
        callback();
    });
}

//----------------------Queries relating to Shopping Functionalities---------------------------
module.exports.getAllMedSupplies = function (callback) {
    db.all("select * from MedSupplies", function (err, rows) {
        console.log(rows.length + " row(s) retrieved from MedSupplies table.");
        callback(rows);
    });
}

module.exports.getShoppingCartDetails = function (cart, callback) {

    module.exports.getAllMedSupplies(function (medSupplies) {

        var cartDetails = [];

        for (var i = 0; i < medSupplies.length; i++) {
            var medItem = medSupplies[i];
            if (cart[medItem.id]) {
                cartDetails.push({
                    id: medItem.id,
                    name: medItem.name,
                    image: medItem.image,
                    price: medItem.price,
                    count: cart[medItem.id]
                });
            }
        }

        callback(cartDetails);

    });
};

module.exports.getOrderHistoryFor = function (username, callback) {
    db.all("select * from Orders WHERE username = ? order by timestamp desc", [username], function (err, orderRows) {

        var orderHistoryMap = {};

        for (var i = 0; i < orderRows.length; i++) {
            orderHistoryMap[orderRows[i].id] = orderRows[i];
        }

        db.all("SELECT od.medSupplyId as 'medSupplyId', m.name as 'name', m.image as 'image', od.orderId as 'orderId', od.count as 'count' " +
            "FROM Orders o, OrderDetails od, medSupplies m " +
            "WHERE o.username = ? AND o.id = od.orderId AND m.id = od.medSupplyId", [username], function (err, orderDetailRows) {

                if (err) {
                    console.log(err);
                }

                for (var i = 0; i < orderDetailRows.length; i++) {
                    var orderDetailRow = orderDetailRows[i];

                    if (!orderHistoryMap[orderDetailRow.orderId].details) {
                        orderHistoryMap[orderDetailRow.orderId].details = [];
                    }

                    orderHistoryMap[orderDetailRow.orderId].details.push({
                        medSupplyId: orderDetailRow.medSupplyId,
                        name: orderDetailRow.name,
                        image: orderDetailRow.image,
                        count: orderDetailRow.count
                    });
                }

                callback(orderRows);

            });
    });
}

module.exports.getNewOrderDetails = function (cart, callback) {

    module.exports.getShoppingCartDetails(cart, function (cartDetails) {

        var totalCost = 0;
        for (var i = 0; i < cartDetails.length; i++) {
            totalCost += (cartDetails[i].count * cartDetails[i].price);
        }

        callback({
            orderDetails: cartDetails,
            totalCost: totalCost
        });

    });
}

module.exports.saveOrder = function (order, username, callback) {

    var date = dateTime.create();
    var timestamp = date.format("Y-m-d H:M");

    db.run("INSERT INTO Orders (username, timestamp, totalCost) VALUES (?, ?, ?)", [username, timestamp, order.totalCost], function (err) {

        var orderId = this.lastID;

        // Everything in here will be run one after the other, without interfering with each other incorrectly.
        db.serialize(function () {

            db.run("BEGIN TRANSACTION");

            for (var i = 0; i < order.orderDetails.length; i++) {
                var orderLine = order.orderDetails[i];

                db.run("INSERT INTO OrderDetails VALUES (?, ?, ?)", [orderId, orderLine.id, orderLine.count]);
            }

            db.run("COMMIT");

        });

        callback();

    });
};

// module.exports.getAllUsernames = function (callback) {
//     db.all("select username from Users", function (err, rows) {
//         if (rows.length > 0) {
//             callback(rows);
//         } else {
//             callback(null);
//         };
//     });
// }

