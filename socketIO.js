var socketio = require('socket.io');
var UserModel = require('./models/user.model');

module.exports.listen = function(app) {
    io = socketio.listen(app);
    io.on('connection', function(socket) {
        console.log('Nguoi dung da ket noi !');

        socket.on('search user', async function(username) {
            console.log('Tìm kiếm người dùng: ' + username);

            var users = await UserModel.find({
                name: { $regex: new RegExp(username, "i") }
            }).limit(100);

            socket.emit('search user result', 'Đã tìm kiếm người dùng: ' + username);
            socket.emit('search data', users);
        });

        socket.on('disconnect', function() {
            console.log('Nguoi dung ngat ket noi');
        });
    });
    return io;
};