var UserModel = require('../models/user.model');
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

    static async updateProfile(req, res)
    {
        await UserModel.updateOne({ _id: ObjectID(req.params.id) }, { permission: req.body.permision })
            .then(doc => {
                //console.log(doc);
            })
            .catch(error => {
                console.error(error);
            });

        res.status(200).send("OK");
    }
}
module.exports = ManageController;