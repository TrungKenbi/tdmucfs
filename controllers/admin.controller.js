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
                .find().skip((perPage * page) - perPage).limit(perPage)
                .exec(function (err, posts) {
                    PostModel.count().exec(function (err, count) {
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
}
module.exports = AdminController;