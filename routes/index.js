var express = require('express');
var router = express.Router();
var passport = require('passport');

var multer = require('multer');

const accepted_extensions = ['jpg', 'jpeg', 'png'];
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,  // 5 MB upload limit
        files: 5                    // 5 file
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
        imageUpload.array('image'),
        PostCtrl.validate('postCFS'),
        PostCtrl.postCFS
    )

    .get('/posts', isLoggedIn, PostCtrl.listPost)
    .get('/posts/:page', isLoggedIn, PostCtrl.listPost)

    .get('/editpost/:id', isLoggedIn, PostCtrl.index)
    .post(
        '/editpost/:id',
        isLoggedIn,
        imageUpload.single('image'),
        PostCtrl.validate('postCFS'),
        PostCtrl.editPost
    )

    .get(
        '/deletepost/:id',
        isLoggedIn,
        PostCtrl.deletePost
    )

    .get('/img/:id', PostCtrl.getIMG)


;

router.get('/profile', isLoggedIn, function(req, res) {
    res.render('member/profile', {
        user : req.user
    });
});


router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    })
);

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// router.get('/fake', function(req, res, next) {
//     var faker = require('faker');
//     faker.locale = "vi";
//     var PostModel = require('../models/post.model');
//     for (var i = 0; i < 1000; i++) {
//         var post = new PostModel();
//
//         post.image = [];
//         post.user = '5ce41a111ddaef27d84a086a';
//         post.content = faker.lorem.text();
//         post.status = randomIntFromInterval(0, 2);
//         post.note = '';
//
//         console.log(post);
//         post.save(function(err) {
//             if (err) throw err
//         })
//     }
//     function randomIntFromInterval(min,max) // min and max included
//     {
//         return Math.floor(Math.random()*(max-min+1)+min);
//     }
//
//     res.redirect('/posts/1');
// });

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}