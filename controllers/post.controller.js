var PostModel = require('../models/post.model');
var ImageModel = require('../models/image.model');

var {check} = require('express-validator/check');

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

    static async postCFS(req, res, next) {
        req
            .getValidationResult()
                .then((error) => {

                    var message = [];

                    console.log(req.body);

                    if (!error.isEmpty())
                    {
                        message = error.array({ onlyFirstError: true })
                    } else {


                        let content = req.body.content;
                        var image = [];

                        if (req.file) {
                            let ImageCFS = new ImageModel({
                                user: req.user._id,
                                data: req.file.buffer
                            });
                            ImageCFS.save()
                                .then(doc => {
                                    image.push(doc._id);
                                })
                                .catch(err => {
                                    console.error(err);
                                });
                        }

                        let PostCFS = new PostModel({
                            user: req.user._id,
                            content: content,
                            image: image,
                            status: 0,
                            note: ''
                        });

                        PostCFS.save()
                            .then(doc => {
                                var success = {
                                    'type': 'success',
                                    'msg': 'Đăng bài thành công !'
                                };
                                message.push(success);
                            })
                            .catch(err => {
                                console.error(err);
                            });

                    }


                    res.render('post', {
                        title: 'Đăng Bài Confession',
                        message: message,
                        user : req.user
                    });


                })
            .catch(next);

    }

    static validate (method) {
        switch (method) {
            case 'postCFS': {
                return [
                    check('content')
                        .isLength({min: 50}).withMessage('Nội dung confession tối thiểu 50 ký tự !'),
                    check('check')
                        .not().isEmpty().withMessage('Bạn phải đọc và đồng ý với quy định trước khi gửi bài !')
                ];
            }

            default:
                return [];
        }
    }
}
module.exports = PostController;