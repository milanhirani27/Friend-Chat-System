var express = require('express');
var router = express.Router();
const usercontroller = require("../controller/usercontroller")

router.get('/register', function (req, res) {res.render('register');});

router.get('/login', function (req, res) {res.render('login');});

router.post('/register', usercontroller.register)

router.post('/login', usercontroller.login);

router.get('/logout', usercontroller.logout);

module.exports = router;