var mongoose = require('mongoose');

// User Schema
var onlineUserSchema = mongoose.Schema({
	name: {
		type: String,
	},
	ID: {
		type: String,
	}
	
})

var onlineUser = module.exports = mongoose.model('onlineUser', onlineUserSchema);