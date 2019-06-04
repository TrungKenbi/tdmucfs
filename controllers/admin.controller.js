var PostModel = require('../models/post.model');
var ImageModel = require('../models/image.model');

class AdminController {
    static async listPost(req, res, next) {
        try {
            var perPage = 10;
            var page = req.params.page || 1;

            var status = [
                '<span class="badge badge-info">Đang đợi duyệt</span>',
                '<span class="badge badge-success">Đã duyệt</span>',
                '<span class="badge badge-danger">Từ chối</span>'
            ];

            await PostModel
                .find().sort({_id: -1}).skip((perPage * page) - perPage).limit(perPage)
                .exec(function (err, posts) {
                    PostModel.countDocuments(
                        // {}, // filters
                        // {}, // options
                        function (err, count) {
                            if (err) return next(err);
                            res.render('admin/listPost', {
                                title: 'Danh Sách Các Bài Đã Đăng Confession',
                                user: req.user,
                                posts: posts,
                                statusList: status,
                                current: page,
                                pages: Math.ceil(count / perPage)
                            });
                        })
                });
        }
        catch (e) {
            res.status(555).send("Fail Admin");
        }
    }

    static async detailPost(req, res, next){
        try {
            var status = [
                '<span class="badge badge-info">Đang đợi duyệt</span>',
                '<span class="badge badge-success">Đã duyệt</span>',
                '<span class="badge badge-danger">Từ chối</span>'
            ];

            console.log(req.query.key);

            await PostModel
                .findOne({ _id:req.query.key })
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
                    res.render('admin/detail', {
                        title: "Hello",
                        user: req.user,
                        statusList: status,
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

    static async postingPost(req, res, next){
        try {
            var keys = req.query.check;
            var posts = [];
            await PostModel
                .find({_id: keys })
                .then(post => {
                    posts = post;
                })
                .catch(err =>{
                    console.log(err);
                });
            console.log(posts);
            res.render('admin/posting', {
                title: "Hello",
                posts: posts
            })
        }
        catch (e) {
            res.status(555).send("Fail Admin");
        }
    }

    static async sendMess(req, res, next){
        try {
            let messages = req.body.messagesOfAdmin;
            let Istatus = req.body.statusPost;
            if(req.body.statusBox=="on")
                Istatus=2;
            else if(Istatus == 2)
                Istatus=0;
            await PostModel
                .updateOne({
                        _id: req.query.key// chạy thử anh
                    },
                    {
                        note: messages,
                        status: Istatus
                }).then(data => {
                    // console.log(data);
                })
                .catch(err => {
                    console.log(err);
                })
            res.redirect('listPost');
        }
        catch (e) {
            res.status(555).send("Fail Admin");
        }
    }

}
module.exports = AdminController;