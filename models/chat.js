var mongoose = require('mongoose');

// User Schema
var chatSchema = mongoose.Schema({
	from: {
		type: String,
	},
	to: {
		type: String
	},
	message: {
		type: String
	},
    date: {
        type: Date
    },
})

var Chat = module.exports = mongoose.model('Chat', chatSchema);