var express = require('express');
var router = express.Router();
var passport = require('passport');

var HomeCtrl = require('../controllers/home.controller');
var PostCtrl = require('../controllers/post.controller');

/* GET home page. */
router
    .get('/', HomeCtrl.index)
    .get('/post', PostCtrl.index)
    .post('/post', PostCtrl.postCFS);

router.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile', {
        user : req.user // get the user out of session and pass to template
    });
});

// =====================================
// FACEBOOK ROUTES =====================
// =====================================
// yêu cầu xác thực bằng facebook
router.get('/auth/facebook', passport.authenticate('facebook'));
// xử lý sau khi user cho phép xác thực với facebook
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    })
);

module.exports = router;


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}