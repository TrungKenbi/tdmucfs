var PostModel = require('../models/post.model');
var ImageModel = require('../models/image.model');
var numeral = require('numeral');

class AdminController {
    static async listPost(req, res, next) {
        try {
            var perPage = 10;
            var page = req.params.page || 1;
            var f = req.query.filter;

            var status = [
                '<span class="badge badge-info">Đang đợi duyệt</span>',
                '<span class="badge badge-success">Đã duyệt</span>',
                '<span class="badge badge-danger">Từ chối</span>'
            ];

            if(f != 0 && f != 1 && f!= 2){
                f = new Array(0,1,2) ;
            }
            await PostModel
                .find({ status: f }).sort({_id: -1}).skip((perPage * page) - perPage).limit(perPage)
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
            var Images = [];

            var tit;
            await PostModel
                .countDocuments({ status: 2 })
                .then(count => {
                    tit = count;
                })
                .catch(err =>{
                    console.log(err);
                });


            var numOfTitle = numeral(tit).format('000000');

            await PostModel
                .find({_id: keys })
                .then(post => {
                    posts = post;
                })
                .catch(err =>{
                    console.log(err);
                });

            var d = 1;
            for(var i = 0; i < posts.length; i++){
                var post = posts[i];
                await ImageModel
                    .find({_id : post.image })
                    .then(Img =>{
                        if(Img.length > 0) {
                            posts[i].content += " (Hình ";
                            Img.forEach(img => {
                                Images.push(img);
                                if(Img.indexOf(img) != 0)
                                    posts[i].content += ", ";
                                posts[i].content += d.toString();
                                d++;
                            });
                            posts[i].content += ")";
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }

            res.render('admin/posting', {
                title: "Hello",
                posts: posts,
                Images: Images,
                numOfTitle: numOfTitle
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

    static async postPost(req, res, next){
        try {
            console.log(req.files);
            res.redirect('listPost');
        }
        catch (e) {
            e.status(555).send("Fail Admin");
        }
    }
}
module.exports = AdminController;