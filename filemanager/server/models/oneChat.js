var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var oneChatSchema = new Schema({
    me: String,
	you: String,
    data: String
});


module.exports = mongoose.model('oneChat', oneChatSchema);