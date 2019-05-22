//Require Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageModelSchema = new Schema({
    user: Schema.Types.ObjectId,
    data: Buffer,
    time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('images', ImageModelSchema );