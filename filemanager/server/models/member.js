var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
    user_name: String,
    user_id: String,
	user_pw: String,
	email: String,
	gender: String,
	birthdate: Date,
	tel: String,
	project: String,
	salt_pw: String
});

module.exports = mongoose.model('member', memberSchema);
