var express = require('express');
var router = express.Router();

var HomeCtrl = require('../controllers/home.controller');
var PostCtrl = require('../controllers/post.controller');

/* GET home page. */
router
    .get('/', HomeCtrl.index)
    .get('/post', PostCtrl.index)
    .post('/post', PostCtrl.postCFS);

module.exports = router;
