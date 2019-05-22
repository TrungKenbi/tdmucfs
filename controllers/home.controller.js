class HomeController {
    static index(req, res) {
        try {
            res.render('index', { title: 'TDMU Confession' , user: req.user});
        } catch(exception) {
            res.status(500).send(exception)
        }
    }
}
module.exports = HomeController;