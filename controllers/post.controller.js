var PostModel = require('../models/post.model');
var ImageModel = require('../models/image.model');
var UserModel = require('../models/user.model');
const {ObjectID} = require("mongodb");

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

class PostController {
    static async index(req, res) {
        try {
            var edit = req.params.id || 0;
            var post = undefined;

            if (edit != 0)
            {
                post = await PostModel.findOne({
                    _id: ObjectID(edit)
                });
            }
            console.log(req.user);
            res.render('member/post', {
                title: 'Đăng Bài Confession',
                user : req.user,
                post: post
            });
        } catch(exception) {
            res.status(500).send(exception)
        }
    }

    static async getIMG(req, res, next)
    {
        ImageModel.findOne({_id: req.params.id})
            .then(img => {
                res.writeHead(200, {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': img.data.length
                });
                res.end(img.data);
            });
    }

    static async postCFS(req, res) {

        var errors = validationResult(req);

        var message = [];

        if (!errors.isEmpty()) {
            message = errors.array({ onlyFirstError: true })
        } else {
            let content = req.body.content;
            var image = []; // mảng lưu ID hình ảnh

            if (req.files) {
                for(var i = 0; i< req.files.length; i++) {
                    var fileImage = req.files[i];
                    let ImageCFS = await new ImageModel({
                        user: req.user._id,
                        data: fileImage.buffer,
                        mimetype: fileImage.mimetype
                    });
                    await ImageCFS.save()
                        .then(async doc => {
                            await console.log(doc);
                            await image.push(doc._id);
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }
                req.files.forEach(async fileImage => {

                });
            }

            await console.log(image);

            let PostCFS = await new PostModel({
                user: req.user._id,
                content: content,
                image: image,
                status: 0,
                note: ''
            });

            await PostCFS.save()
                .then(async doc => {
                    var success = {
                        'type': 'success',
                        'msg': 'Đăng bài thành công, vui lòng đợi admin duyệt bài để được đưa lên fanpage nhé !'
                    };
                    message.push(success);
                    await PostModel
                        .countDocuments({user:req.user._id})
                        .then(count => {
                            console.log(count);
                            UserModel
                                .updateOne({_id:req.user._id},{ countPost:count, point: count })
                                .then(data => {
                                    // console.log(data);
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        })
                        .catch(err => {
                            console.log(err);
                        })
                })
                .catch(err => {
                    console.error(err);
                });



        }

        res.render('member/post', {
            title: 'Đăng Bài Confession',
            message: message,
            user : req.user
        });
    }

    static async listPost(req, res, next)
    {
        var perPage = 10;
        var page = req.params.page || 1;

        var status = [
            '<span class="badge badge-info">Waiting</span>',
            '<span class="badge badge-success">Accept</span>',
            '<span class="badge badge-danger">Decline</span>'
        ];

        await PostModel
            .find({
                user: req.user
            }).sort({ _id: -1 }).skip((perPage * page) - perPage).limit(perPage)
            .exec(function(err, posts) {
                PostModel.countDocuments({
                    user: req.user
                }).exec(function(err, count) {
                    if (err) return next(err);
                    res.render('member/posts', {
                        title: 'Danh Sách Đã Đăng Confession',
                        user : req.user,
                        posts: posts,
                        statusList: status,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });
                })
            });
    }

    static async detailPost(req, res, next){
        try {
            var message = [];
            var status = [
                '<span class="badge badge-info">Đang đợi duyệt</span>',
                '<span class="badge badge-success">Đã duyệt</span>',
                '<span class="badge badge-danger">Từ chối</span>'
            ];

            await PostModel
                .findOne({ _id : req.query.key })
                .then(async poster => {
                    var Images = [];
                    await ImageModel
                        .find({_id : poster.image })
                        .then(Img =>{
                            Images = Img;
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    // console.log(poster);
                    res.render('member/detail', {
                        title: "Chi tiết bài đăng",
                        user: req.user,
                        statusList: status,
                        message: message,
                        poster: poster,
                        Images: Images
                    })
                })
                .catch(err =>{
                    console.log(err);
                })

        }
        catch (e) {
            res.status(555).send("Fail Admin");
        }
    }

    static async editPost(req, res, next)
    {
        var errors = validationResult(req);

        var message = [];

        if (!errors.isEmpty()) {
            message = errors.array({ onlyFirstError: true });
            var PostCFS = await PostModel.findOne({
                _id: ObjectID(req.params.id),
                user: req.user._id
            });
        } else {
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

            var PostCFS = await PostModel.findOne({
                _id: ObjectID(req.params.id),
                user: req.user._id
            });

            PostCFS.content = content;
            PostCFS.status = 0;
            if (image.length)
                PostCFS.image = image;

            await PostCFS.save()
                .then(doc => {
                    var success = {
                        'type': 'success',
                        'msg': 'Sửa bài thành công !'
                    };
                    message.push(success);
                })
                .catch(err => {
                    console.error(err);
                });

        }

        res.render('member/post', {
            title: 'Đăng Bài Confession',
            message: message,
            user : req.user,
            post: PostCFS
        });
    }

    static async deletePost (req, res, next)
    {
        await PostModel.deleteOne({
            _id: ObjectID(req.params.id),
            user: req.user._id,
            status: 0
        });
        res.redirect('/posts');
    }

    static validate (method) {
        switch (method) {
            case 'postCFS': {
                return [
                    body('content')
                        .isLength({ min: 50 }).withMessage('Nội dung confession tối thiểu 50 ký tự !').trim().escape(),
                    body('check')
                        .not().isEmpty().withMessage('Bạn phải đọc và đồng ý với quy định trước khi gửi bài !').trim().escape()
                ];
            }

            default:
                return [];
        }
    }
}
module.exports = PostController;