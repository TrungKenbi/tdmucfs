class HomeController {
    static index(req, res, next) {
        try {
            res.render('index', { title: 'TDMU CFS' , user: req.user});
        } catch(exception) {
            res.status(500).send(exception)
        }
    }
}
module.exports = HomeController;