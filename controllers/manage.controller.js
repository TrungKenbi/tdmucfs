var UserModel = require('../models/user.model');
var PostModel = require('../models/post.model');
const {ObjectID} = require("mongodb");

class ManageController {
    static async index(req, res, next) {
        try {
            var perPage = 10;
            var page = req.params.page || 1;

            var permision = [
                '<span class="badge badge-info">Đang đợi duyệt</span>',
                '<span class="badge badge-success">Đã duyệt</span>',
                '<span class="badge badge-danger">Từ chối</span>'
            ];

            await UserModel
                .find().skip((perPage * page) - perPage).limit(perPage)
                .exec(function (err, users) {
                    UserModel.countDocuments(
                        function (err, count) {
                            if (err) return next(err);
                            res.render('admin/manageUser', {
                                title: 'Quản Lý Thành Viên',
                                user: req.user,
                                users: users,
                                current: page,
                                pages: Math.ceil(count / perPage)
                            });
                        })
                });
        } catch (e) {
            res.status(403).send("Forbidden");
        }
    }

    static async viewProfile(req, res, next)
    {
        var permisions = [
            'Thành viên',
            'Biên Tập Viên',
            'Tổng Biên Tập Viên',
            'Giám Đốc Điều Hành'
        ];
        var profileID = req.params.id;
        var userView = await UserModel.findOne({ _id: profileID });
        res.render('admin/profileUser', {
            title: 'Thông Tin Thành Viên',
            user: req.user,
            permisions: permisions,
            userView: userView
        });
    }

    static async viewProfileUser(req, res, next)
    {
        try {
            var permisions = [
                'Thành viên',
                'Biên Tập Viên',
                'Tổng Biên Tập Viên',
                'Giám Đốc Điều Hành'
            ];
            var profileID = req.params.id;
            var userView = await UserModel.findOne({ _id: profileID });
            res.render('member/profile', {
                title: 'Thông Tin Thành Viên',
                user: req.user,
                permisions: permisions,
                userView: userView
            });
        }
        catch (e) {
            res.status(200).send('Error Manager!');
        }

    }

    static async updateProfile(req, res)
    {
        var key = req.query.key;
        if(key == 0 ) {
            await UserModel.updateOne({_id: ObjectID(req.params.id)}, {permission: req.body.permision})
                .then(doc => {
                    //console.log(doc);
                })
                .catch(error => {
                    console.error(error);
                });
        } else if (key == 1) {
            await UserModel.updateOne({_id: ObjectID(req.params.id)}, {signer: req.body.signer})
                .then(doc => {
                    //console.log(doc);
                })
                .catch(error => {
                    console.error(error);
                });
        }
        res.status(200).send("OK");
    }

    static async update(req, res, next){
        try {
            await UserModel
                .find()
                .then(async data => {
                    let users = data;
                    for (var i = 0; i < users.length; i++){
                        var user = users[i];
                        await PostModel
                            .countDocuments({user:user._id})
                            .then(count => {
                                console.log(count);
                                UserModel
                                    .updateOne({_id:user._id},{ countPost:count, point: count })
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
                    }
                })
                .catch(err =>{
                    console.log(err)
                })

            res.redirect('/');
        }
        catch (e) {
            res.status(201).send('Fail Update');
        }
    }
}
module.exports = ManageController;