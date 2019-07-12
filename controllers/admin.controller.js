var PostModel = require('../models/post.model');
var ImageModel = require('../models/image.model');
var PostedModel = require('../models/posted.model');
var UserModel = require('../models/user.model');
var decode = require('unescape');
var numeral = require('numeral');
const {ObjectId} = require("mongodb");

const rp = require('request-promise');
const url = 'https://graph.facebook.com/v3.3/me/accounts?access_token=' + process.env.TOKEN;
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

class AdminController {

    static async index(req, res, next) {
        res.render('admin/index', {
            title: 'Quản Lý Hệ Thống Confession',
            user: req.user
        });
    }

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

            if((f != 0 && f != 1 && f != 2)){
                f = new Array(0,1,2) ;
            }

            await PostModel
                .find({ status: f }).sort({time: -1}).skip((perPage * page) - perPage).limit(perPage)
                .exec(function (err, posts) {
                    PostModel.countDocuments(
                        { status: f }, // filters
                        // {}, // options
                        async function (err, count) {
                            if (err) return next(err);
                            var user_Post = [];
                            for(var i = 0; i < posts.length; i++){
                                await UserModel
                                    .findOne({ _id: posts[i].user })
                                    .then(async data => {
                                        user_Post.push(data);
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            }
                            res.render('admin/listPost', {
                                title: 'Danh Sách Các Bài Đã Đăng Confession',
                                user: req.user,
                                filter: f,
                                posts: posts,
                                statusList: status,
                                current: page,
                                pages: Math.ceil(count / perPage),
                                user_Post: user_Post
                            });
                        })
                });
        }
        catch (e) {
            res.status(500).send("Có lỗi, vui lòng liên hệ ChickenFlyStudio !!! [ListPostError]");
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
                .findOne({ _id : req.query.key })
                .then(async poster => {
                    var Images = [];
                    await ImageModel
                        .find({_id : poster.image })
                        .then(Img => {
                            Images = Img;
                        })
                        .catch(err => {
                            console.log(err);
                        });
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
            var indexImages = [];

            var tit;
            await PostedModel
                .countDocuments()
                .then(count => {
                    tit = count;
                })
                .catch(err =>{
                    console.log(err);
                });


            var numOfTitle = numeral(tit).format('000000');

            await PostModel
                .find({_id: keys, status: 0 })
                .then(post => {
                    posts = post;
                })
                .catch(err =>{
                    console.log(err);
                });

            for(var i = 0; i < posts.length; i++){
                var post = posts[i];
                await ImageModel
                    .find({_id : post.image })
                    .then(Img =>{
                        if(Img.length > 0) {
                            let t = [];
                            Img.forEach(img => {
                                t.push(Images.length);
                                Images.push(img);
                            });
                            let key = post._id;
                            indexImages[key] = t;
                            posts[i].content += " (Có hình 👇👇👇)";
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }

            // console.log(indexImages);

            res.render('admin/posting', {
                title: "Hello",
                posts: posts,
                Images: Images,
                indexImages: indexImages,
                numOfTitle: numOfTitle,
                user: req.user
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
                        _id: req.query.key
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
            res.redirect('listPost?filter=0');
        }
        catch (e) {
            res.status(555).send("Fail Admin");
        }
    }

    static async postPost(req, res, next){
        try {
            // var id = "2715971488430698"; // <- id page bán chè@@
            var id = "649079911793156";
            var access_token;
            var arrToken = [];
            var titlePost = req.body.title;
            var subTitle = req.body.subtitle;
            var content = req.body.content;
            var bottomspace = "-------------------------------------";
            var commentOfAd = req.body.commentOfAd;
            var images = [];
            var imgkeys = req.files;
            var imgs = req.body.img;
            var idImgs = [];
            var postkeys = req.body.head_check;
            var messagePost = "";
            var signer = "";

            await UserModel
                .findOne({ _id: req.user._id })
                .then(async data => {
                    if(data.signer != undefined)
                        signer = data.signer;
                })
                .catch(err => {
                    console.log(err);
                })

            messagePost += (titlePost + '\n');
            if(Array.isArray(postkeys)) {
                for (var i = 0; i < postkeys.length; i++)
                    messagePost += (subTitle[i] + '\n' + content[i] + '\n');
                messagePost += bottomspace + '\n';
            }
            else if(subTitle != undefined) {
                messagePost += (subTitle + '\n' + content + '\n' + bottomspace + '\n');
            }
            messagePost += (commentOfAd);
            messagePost += ('\n' + signer);

            await rp(url)
                .then(function(html){
                    //success!
                    arrToken = JSON.parse(html);
                    // console.log(arrToken);
                })
                .catch(function(err){
                    //handle error
                });

            for (var i = 0; i < arrToken.data.length; i++){
                var subToken = arrToken.data[i];
                if(subToken.id == id){
                    access_token = subToken.access_token;
                    // console.log(subToken.access_token);
                }
            }

            if(Array.isArray(imgs)) {
                for (var i = 0; i < imgs.length; i++) {
                    let img = imgs[i];
                    await ImageModel
                        .findOne({_id: img})
                        .then(async data => {
                            let imgOption = {
                                method: 'POST',
                                uri: `https://graph.facebook.com/v3.3/${id}/photos`,
                                qs: {
                                    access_token: access_token,
                                    caption: "Hình " + (i + 1),
                                    published: false,
                                    url: process.env.ImgURL + img
                                    // url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/63/IMG_%28business%29.svg/1200px-IMG_%28business%29.svg.png'
                                }// em pull ve chua, sao ki nhi ko thay, doi a chut
                            };
                            await rp(imgOption)
                                .then(function (html) {
                                    // const permalink = JSON.parse(html).permalink_url;
                                    // console.log(permalink);
                                    // if(video) {
                                    //     permalink = `https://www.facebook.com${permalink}`;
                                    // }
                                    // return { postUrl: permalink };
                                    var idPosted = JSON.parse(html);
                                    // console.log(idPosted.id);
                                    images.push({media_fbid: idPosted.id});
                                    idImgs.push(img);
                                })
                                .catch(function (err) {
                                    //handle error
                                    console.log(err);
                                });
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }
            }else if(imgs != undefined){
                let img = imgs;
                var i = 0;
                await ImageModel
                    .findOne({_id: img})
                    .then(async data => {
                        // console.log(data);
                        let imgOption = {
                            method: 'POST',
                            uri: `https://graph.facebook.com/v3.3/${id}/photos`,
                            qs: {
                                access_token: access_token,
                                caption: "Hình " + (i + 1),
                                published: false,
                                url: process.env.ImgURL + img
                                // url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/63/IMG_%28business%29.svg/1200px-IMG_%28business%29.svg.png'
                                // url: process.env.ImgURL + idImg
                            }
                        };
                        await rp(imgOption)
                            .then(function (html) {
                                // const permalink = JSON.parse(html).permalink_url;
                                // console.log(permalink);
                                // if(video) {
                                //     permalink = `https://www.facebook.com${permalink}`;
                                // }
                                // return { postUrl: permalink };
                                var idPosted = JSON.parse(html);
                                // console.log(idPosted.id);
                                images.push({media_fbid: idPosted.id});
                            })
                            .catch(function (err) {
                                //handle error
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.log(err)
                    })

            }
            for(var i=0; i < imgkeys.length; i++){
                var fileImage = imgkeys[i];
                let ImageCFS = await new ImageModel({
                    user: req.user._id,
                    data: fileImage.buffer,
                    mimetype: fileImage.mimetype
                });
                await ImageCFS.save()
                    .then(async doc => {
                        // console.log(doc);
                        // images.push({ media_fbid : doc._id });
                        let idImg = doc._id;
                        let imgOption = {
                            method: 'POST',
                            uri: `https://graph.facebook.com/3.3/${id}/photos`,
                            qs: {
                                access_token: access_token,
                                caption: "Hình of Admin",
                                published: false,
                                url: process.env.ImgURL+doc._id
                                // url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/63/IMG_%28business%29.svg/1200px-IMG_%28business%29.svg.png'
                                // url: process.env.ImgURL + idImg
                            }
                        };
                        await rp(imgOption)
                            .then(function (html) {
                                // const permalink = JSON.parse(html).permalink_url;
                                // console.log(permalink);
                                // if(video) {
                                //     permalink = `https://www.facebook.com${permalink}`;
                                // }
                                // return { postUrl: permalink };
                                var idPosted = JSON.parse(html);
                                // console.log(idPosted.id);
                                images.push({media_fbid: idPosted.id});
                                idImgs.push(doc._id);
                            })
                            .catch(function (err) {
                                //handle error
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }

            messagePost = entities.decode(messagePost);
            var postTextOptions = {
                method: 'POST',
                    uri: `https://graph.facebook.com/v3.3/${id}/feed`,
                qs: {
                    access_token: access_token,
                    message: messagePost,
                    attached_media: images
                }
            };

            await rp(postTextOptions)
                .then(async function(html){
                    const permalink = await 'https://www.facebook.com/' + JSON.parse(html).id;
                    console.log(permalink);
                    // if(video) {
                    //     permalink = `https://www.facebook.com${permalink}`;
                    // }
                    let PostedCFS = await new PostedModel({
                        user: req.user._id,
                        title: titlePost,
                        content: messagePost,
                        image: idImgs,
                        comment: commentOfAd,
                        PostUrl: permalink
                    });
                    await PostedCFS.save()
                        .then(async doc => {
                            if(Array.isArray(postkeys)) {
                                for (var i = 0; i < postkeys.length; i++) {
                                    let idPost = postkeys[i];
                                    await PostModel
                                        .updateOne(
                                            {_id: idPost},
                                            {
                                                status: 1,
                                                user_upload: req.user._id,
                                                PostUrl: permalink
                                            })
                                        .then(async doc => {
                                            // console.log(doc);
                                        })
                                        .catch(err => {
                                            console.error(err);
                                        });
                                }
                            }
                            else if(postkeys != undefined){
                                let idPost = postkeys;
                                await PostModel
                                    .updateOne(
                                        {_id: idPost},
                                        {
                                            status: 1,
                                            user_upload: req.user._id,
                                            PostUrl: permalink
                                        })
                                    .then(async doc => {
                                        // console.log(doc);
                                    })
                                    .catch(err => {
                                        console.error(err);
                                    });
                            }

                            // await console.log(doc);
                        })
                        .catch(err => {
                            console.error(err);
                        });
                })
                .catch(function(err){
                    //handle error
                    console.log(err);
                });

            res.redirect('listPost?filter=0');
        }
        catch (e) {
            e.status(555).send("Fail Admin");
        }
    }
}
module.exports = AdminController;
