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
    .post('/sendmess', AdminCtrl.sendMess)
    .post('/post', imageUpload.array('image'), AdminCtrl.postPost);

module.exports = router;

function isAdmin(req, res, next) {
     if (req.isAuthenticated() && req.user.permission >= 3)
    //if(true)
        return next();
    res.status(403).json({message: "Forbidden"});
}