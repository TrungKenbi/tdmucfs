let PostModel = require('../models/post.model');

class PostController {
    static index(req, res, next) {
        try {
            res.render('post', { title: 'Đăng Bài Confession', user : req.user });
            console.log(req);
        } catch(exception) {
            res.status(500).send(exception)
        }
    }

    static postCFS(req, res, next) {
        try {
            let content = req.body.content;

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