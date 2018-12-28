// separate file for database access functions

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('book_and_shop.db');

// enable foreign keys on the database which is not enabled by default
db.get("PRAGMA foreign_keys = ON");

// allows us to create a nice looking date and time
var dateTime = require('node-datetime');
