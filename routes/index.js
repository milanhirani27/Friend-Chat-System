var express = require('express');
const path = require('path');
var router = express.Router();
const usercontroller = require('../controller/usercontroller');
const { ensureAuthenticated } = require('../config/auth')

// Get Homepage
router.get('/dashboard', ensureAuthenticated, function(req, res){
	res.render('index', {
		newfriend: req.user.request
	});
});

// router.get('/chat', (req,res)=>{res.sendFile(path.resolve(__dirname, '../front/chat.html'))});
router.get('/chat', usercontroller.chatg);

router.post('/chat', usercontroller.chatp);

router.get('/search', ensureAuthenticated, usercontroller.searchg);

router.post('/search', ensureAuthenticated, usercontroller.searchp);

router.post('/dashboard', usercontroller.homepage);

module.exports = router;