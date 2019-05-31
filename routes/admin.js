var express = require('express');
var router = express.Router();
var passport = require('passport');

var HomeCtrl = require('../controllers/home.controller');
var AdminCtrl = require('../controllers/admin.controller');

router
    .get('/', isAdmin, function (req, res, next) {
        res.status(403).json({message: "hhi"});
    })
    .get('/listPost', AdminCtrl.listPost)
    .get('/listPost/:page', AdminCtrl.listPost)
    .get('/detail', AdminCtrl.detailPost)
    .get('/posting', AdminCtrl.postingPost)
    .post('/sendmess', AdminCtrl.sendMess);

module.exports = router;

function isAdmin(req, res, next) {
     if (req.isAuthenticated() && req.user.permission >= 3)
    //if(true)
        return next();
    res.status(403).json({message: "Forbidden"});
}