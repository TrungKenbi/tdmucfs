var express = require('express');
var router = express.Router();
var passport = require('passport');

var HomeCtrl = require('../controllers/home.controller');

router
    .get('/', isAdmin, function (req, res, next) {
        res.status(403).json({message: "hhi"});
    });


module.exports = router;

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.permission >= 3)
        return next();
    res.status(403).json({message: "Forbidden"});
}