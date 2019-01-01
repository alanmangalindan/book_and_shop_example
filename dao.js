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

//----------------------Queries relating to Professionals---------------------------
module.exports.getAllProfessionals = function (callback) {
    db.all("select * from Professionals", function (err, rows) {
        if (rows.length > 0) {
            console.log(rows.length + " row(s) retrieved from Professionals table.");
            callback(rows);
        } else {
            console.log(rows.length + " row(s) retrieved from Professionals table.");
            callback(null);
        };
    });
}


module.exports.getTimeSelection = function (callback) {
    db.all("select * from TimeSelection", function (err, rows) {
        if (rows.length > 0) {
            console.log(rows.length + " row(s) retrieved from TimeSelection table.");
            callback(rows);
        } else {
            console.log(rows.length + " row(s) retrieved from TimeSelection table.");
            callback(null);
        };
    });
}
// module.exports.updateUser = function (u, callback) {
//     db.run("update Users set password = ?, dob = ?, country = ?, avatar = ?, fname = ?, lname = ?, activeFlag = ?, description = ? where username = ?", [u.password, u.dob, u.country, u.avatar, u.fname, u.lname, u.activeFlag, u.description, u.username], function (err) {
//         if (err) {
//             console.log(err);
//         }
//         console.log(this.changes + " row(s) affected in Users table.");
//         callback();
//     });

// }

// module.exports.getAllUsernames = function (callback) {
//     db.all("select username from Users", function (err, rows) {
//         if (rows.length > 0) {
//             callback(rows);
//         } else {
//             callback(null);
//         };
//     });
// }

// module.exports.deleteUser = function (u, callback) {
//     db.run("update Users set activeFlag = 0 where username = ?", [u], function (err) {
//         if (err) {
//             console.log(err);
//         }
//         console.log(this.changes + " row(s) affected in Users table.");
//         callback();
//     });
// }