var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');

const accepted_extensions = ['jpg', 'jpeg', 'png'];

const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,  // 5 MB upload limit
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

var ManageCtrl = require('../controllers/manage.controller');
var AdminCtrl = require('../controllers/admin.controller');

router
    .get('/', isAdmin, AdminCtrl.index)
    .get('/listPost', isAdmin, AdminCtrl.listPost)
    .get('/listPost/:page', isAdmin, AdminCtrl.listPost)
    .get('/detail', isAdmin, AdminCtrl.detailPost)
    .get('/posting', isAdmin, AdminCtrl.postingPost)
    .post('/sendmess', isAdmin, AdminCtrl.sendMess)
    .post('/post', isAdmin, imageUpload.array('image'), AdminCtrl.postPost)

    .get('/manageUser', isAdmin, ManageCtrl.index)
    .get('/manageUser/:page', isAdmin, ManageCtrl.index)
    .get('/manageUser/view/:id', isAdmin, ManageCtrl.viewProfile)
    .post('/manageUser/update/:id', isAdmin, ManageCtrl.updateProfile)
;

// Co ve hoi chuoi nhi ?? xoq r a, ok, con c

module.exports = router;

function isAdmin(req, res, next) {
     if (req.isAuthenticated() && req.user.permission >= 0)
    //if(true)
        return next();
    res.status(403).json({message: "Forbidden"});
}

router
    .get('/login/facebook/admin',
        passport.authenticate('facebook', {
                scope: ['publish_actions', 'manage_pages']
            }
        ));