//Require Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserModelSchema = new Schema({
    name: String,
    facebook: {
        id: Number,
        token: String
    },
    permission: { type: Number, default: 0 },
    countPost: { type: Number, default: 0 },
    point: { type: Number, default: 0 }
});

UserModelSchema.statics.findOneOrCreate = function findOneOrCreate(condition, callback) {
    const self = this;
    self.findOne(condition, (err, result) => {
        return result ? callback(err, result) : self.create(condition, (err, result) => { return callback(err, result); });
    })
};

module.exports = mongoose.model('users', UserModelSchema );