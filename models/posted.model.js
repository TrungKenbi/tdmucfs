//Require Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostedModelSchema = new Schema({
    user: Schema.Types.ObjectId,
    title: String,
    content: String,
    image: [Schema.Types.Array],
    time: { type: Date, default: Date.now },
    comment: String,
    PostUrl: String,
});

module.exports = mongoose.model('posteds', PostedModelSchema );