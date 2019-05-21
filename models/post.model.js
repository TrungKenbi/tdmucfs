//Require Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostModelSchema = new Schema({
    user: Schema.Types.ObjectId,
    content: String,
    image: [Schema.Types.ObjectId],
    time: { type: Date, default: Date.now },
    status: Number,
    note: String
});

module.exports = mongoose.model('posts', PostModelSchema );