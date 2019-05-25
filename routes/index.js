var express = require('express');
var router = express.Router();
var passport = require('passport');

var multer = require('multer');

const accepted_extensions = ['jpg', 'jpeg', 'png'];
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,  // 5 MB upload limit
        files: 1                    // 1 file
    },
    fileFilter: (req, file, cb) => {
        // if the file extension is in our accepted list
        if (accepted_extensions.some(ext => file.originalname.endsWith("." + ext))) {
            return cb(null, true);
        }

        // otherwise, return error
        return cb(new Error('Only ' + accepted_extensions.join(", ") + ' files are allowed!'));
    }
});

var HomeCtrl = require('../controllers/home.controller');
var PostCtrl = require('../controllers/post.controller');

/* GET home page. */
router
    .get('/', HomeCtrl.index)
    .get('/post', isLoggedIn, PostCtrl.index)
    .post(
        '/post',
        isLoggedIn,
        imageUpload.single('image'),
        PostCtrl.validate('postCFS'),
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