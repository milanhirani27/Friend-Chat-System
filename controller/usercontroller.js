var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var formidable = require('formidable');
var path = require('path');
var async = require('async');
var User = require('../models/user');

// Register User
exports.register = function (req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		res.render('register', {
			errors: errors
		});
	}
	else {
		//checking for email and username are already taken
		User.findOne({ username: { 
			"$regex": "^" + username + "\\b", "$options": "i"
	}}, function (err, user) {
			User.findOne({ email: { 
				"$regex": "^" + email + "\\b", "$options": "i"
		}}, function (err, mail) {
				if (user || mail) {
					res.render('register', {
						user: user,
						mail: mail
					});
				}
				else {
					var newUser = new User({
						name: name,
						email: email,
						username: username,
						password: password
					});
					User.createUser(newUser, function (err, user) {
						if (err) throw err;
						console.log(user);
					});
         	req.flash('success_msg', 'You are registered and can now login');
					res.redirect('/users/login');
				}
			});
		});
	}
};

passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, { message: 'Unknown User' });
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
		});
	}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});


//login
exports.login = 
	passport.authenticate('local', { 
        successRedirect: '/dashboard', 
        failureRedirect: '/users/login', 
        failureFlash: true }),
	function (req, res) {
		res.redirect('/');
	};
    
//search
exports.searchg =  function(req, res){
	var sent =[];
	var friends= [];
	var received= [];
	received= req.user.request; 	
	sent= req.user.sentRequest;
	friends= req.user.friendsList;
	


	User.find({username: {$ne: req.user.username}}, function(err, result){
		if (err) throw err;
		
		res.render('search',{
			result: result,
			sent: sent,
			friends: friends,
			received: received
		});
	});
};

exports.searchp = function(req, res) {
     var searchfriend = req.body.searchfriend;
   if(searchfriend) {
        var mssg= '';
       if (searchfriend == req.user.username) {
           searchfriend= null;
       }

        User.find({username: searchfriend}, function(err, result) {
            if (err) throw err;
                res.render('search', {
                result: result,
                mssg : mssg
            });
      	});	
   }
    
    async.parallel([
       function(callback) {
           if(req.body.receiverName) {
                   User.update({
                       'username': req.body.receiverName,
                       'request.userId': {$ne: req.user._id},
                       'friendsList.friendId': {$ne: req.user._id}
                   }, 
                   {
                       $push: {request: {
                       userId: req.user._id,
                       username: req.user.username
                       }},
                       $inc: {totalRequest: 1}
                       },(err, count) =>  {
                           console.log(err);
                           callback(err, count);
                       })
           }
       },
       function(callback) {
           if(req.body.receiverName){
                   User.update({
                       'username': req.user.username,
                       'sentRequest.username': {$ne: req.body.receiverName}
                   },
                   {
                       $push: {sentRequest: {
                       username: req.body.receiverName
                       }}
                       },(err, count) => {
                       callback(err, count);
                       })
           }
       }],
   (err, results)=>{
       res.redirect('/search');
   });

           async.parallel([
               // this function is updated for the receiver of the friend request when it is accepted
               function(callback) {
                   if (req.body.senderId) {
                       console.log('111',req.body.senderId);
                       User.update({
                           '_id': req.user._id,
                           'friendsList.friendId': {$ne:req.body.senderId}
                       },{
                           $push: {friendsList: {
                               friendId: req.body.senderId,
                               friendName: req.body.senderName
                           }},
                           $pull: {request: {
                               userId: req.body.senderId,
                               username: req.body.senderName
                           }},
                           $inc: {totalRequest: -1}
                       }, (err, count)=> {
                           callback(err, count);
                       });
                   }
               },

               function(callback) {
                   if (req.body.senderId) {
                       User.update({
                           '_id': req.body.senderId,
                           'friendsList.friendId': {$ne:req.user._id}
                       },{
                           $push: {friendsList: {
                               friendId: req.user._id,
                               friendName: req.user.username
                           }},
                           $pull: {sentRequest: {
                               username: req.user.username
                           }}
                       }, (err, count)=> {
                           callback(err, count);
                       });
                   }
               },
               function(callback) {
                   if (req.body.user_Id) {
                       User.update({
                           '_id': req.user._id,
                           'request.userId': {$eq: req.body.user_Id}
                       },{
                           $pull: {request: {
                               userId: req.body.user_Id
                           }},
                           $inc: {totalRequest: -1}
                       }, (err, count)=> {
                           callback(err, count);
                       });
                   }
               },
               function(callback) {
                   if (req.body.user_Id) {
                       User.update({
                           '_id': req.body.user_Id,
                           'sentRequest.username': {$eq: req.user.username}
                       },{
                           $pull: {sentRequest: {
                               username: req.user.username
                           }}
                       }, (err, count)=> {
                           callback(err, count);
                       });
                   }
               } 		
           ],(err, results)=> {
               res.redirect('/search');
           });
};

//home page
exports.homepage = function(req, res) {
	var form =new formidable.IncomingForm();
	form.parse(req);
	let reqPath= path.join(__dirname, '../');
	let newfilename;
	form.on('fileBegin', function(name, file){
		file.path = reqPath+ 'public/upload/'+ req.user.username + file.name;
		newfilename= req.user.username+ file.name;
	});
	form.on('file', function(name, file) {
		User.findOneAndUpdate({
			username: req.user.username
		},
		{
			'userImage': newfilename
		},
		function(err, result){
			if(err) {
				console.log(err);
			}
		});
	});
	req.flash('success_msg', 'Your profile picture has been uploaded');
	res.redirect('/');
};

//chat
exports.chatg = (req,res)=>{
    console.log(1212121);
    
    res.sendFile(path.resolve(__dirname, '../front/chat.html'))
}

exports.chatp = (req,res)=>{
    
}

//logout
exports.logout =  function (req, res) {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
};
