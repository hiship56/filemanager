var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var everyChatSchema = new Schema({
    user_id: String,
    data: String
});


module.exports = mongoose.model('everyChat', everyChatSchema);