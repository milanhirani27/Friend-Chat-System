var express = require('express');
var path = require('path');
var http = require('http');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var socketIO = require('socket.io');

// Set Port
const port = process.env.PORT || 3000;

//database connection 
require('./models/db');

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();
const server = http.createServer(app);
const io= socketIO(server);


//set static folder
app.use(express.static(path.join(__dirname, 'routes')))

//socket
require('./socket/friend')(io);

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
  helpers: {
    ifIn: function(elem, list, options) {
      if(list.indexOf(elem) > -1) {
        return options.fn(this);
      }
      return options.inverse(this);
    }
  },
  defaultLayout:'layout'
}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname,'front')));

// Express Session
app.use(session({
    secret: 'secret',
    cookie: {
      expires: 3600000
    },
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


app.use('/', routes);
app.use('/users', users);

server.listen(port,()=>{
  console.log(`app listening on port ${port}`);
});
