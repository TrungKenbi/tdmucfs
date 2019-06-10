//Require Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserModelSchema = new Schema({
    name: String,
    facebook: {
        id: Number,
        token: String
    },
    signer: String,
    permission: { type: Number, default: 0 },
    countPost: { type: Number, default: 0 },
    point: { type: Number, default: 0 }
});

module.exports = mongoose.model('users', UserModelSchema );