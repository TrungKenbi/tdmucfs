var PostModel = require('../models/post.model');
var ImageModel = require('../models/image.model');

class PostController {
    static index(req, res) {
        try {
            res.render('post', {
                title: 'Đăng Bài Confession',
                user : req.user
            });
        } catch(exception) {
            res.status(500).send(exception)
        }
    }

    static async postCFS(req, res) {
        try {
            let content = req.body.content;
            var image = [];

            if (req.file) {
                let ImageCFS = new ImageModel({
                    user: req.user._id,
                    data: req.file.buffer
                });
                await ImageCFS.save()
                    .then(doc => {
                        image.push(doc._id);
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }

            let PostCFS = new PostModel ({
                user: req.user._id,
                content: content,
                image: image,
                status: 0,
                note: ''
            });

            await PostCFS.save()
                .then(doc => {
                    //console.log(doc);
                })
                .catch(err => {
                    console.error(err);
                });

            var message = 'Đăng bài thành công !!!';
            res.render('post', {
                title: 'Đăng Bài Confession',
                message: message,
                user : req.user
            });
        } catch(exception) {
            res.status(500).send(exception)
        }
    }
}
module.exports = PostController;