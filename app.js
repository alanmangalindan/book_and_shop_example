// Set up express
var express = require('express');

var app = express();

// Listen on port 3000
app.set('port', process.env.PORT || 3000);

// Set up handlebars
var handlebars = require('express-handlebars');
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');