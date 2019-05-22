var PostModel = require('../models/post.model');
var ImageModel = require('../models/image.model');
var upload    = require('../helpers/upload');

class PostController {
    static index(req, res, next) {
        try {
            res.render('post', { title: 'Đăng Bài Confession', user : req.user });
        } catch(exception) {
            res.status(500).send(exception)
        }
    }

    static postCFS(req, res, next) {
        try {
            let content = req.body.content;

            upload(req, res => {
                var fullPath = "../public/files/" + req.file.filename;
                var fs = require('fs');
                var imageData = fs.readFileSync(fullPath);

                var image = new ImageModel({
                    user: req.user._id,
                    data: imageData
                });
                image.save(function (error) {
                    if (error) {
                        throw error;
                    }
                    //res.redirect('/?msg=1');
                });
            });

            let PostCFS = new PostModel ({
                user: req.user._id,
                content: content,
                image: [],
                status: 0,
                note: ''
            });

            PostCFS.save()
                .then(doc => {
                    console.log(doc);
                })
                .catch(err => {
                    console.error(err);
                });

            var message = 'Đăng bài thành công: ' + content;
            res.render('post', { title: 'Đăng Bài Confession', message: message, user : req.user });
        } catch(exception) {
            res.status(500).send(exception)
        }
    }
}
module.exports = PostController;