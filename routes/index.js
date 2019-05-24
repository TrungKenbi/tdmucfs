var express = require('express');
var router = express.Router();
var passport = require('passport');

var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

var HomeCtrl = require('../controllers/home.controller');
var PostCtrl = require('../controllers/post.controller');

/* GET home page. */
router
    .get('/', HomeCtrl.index)
    .get('/post', isLoggedIn, PostCtrl.index)
    .post(
        '/post',
        isLoggedIn,
        PostCtrl.validate('postCFS'),
        upload.single('image'),
        PostCtrl.postCFS
    );

router.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile', {
        user : req.user
    });
});


router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/post',
        failureRedirect: '/'
    })
);

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}