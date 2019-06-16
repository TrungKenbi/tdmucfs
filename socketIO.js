var socketio = require('socket.io');

module.exports.listen = function(app) {
    io = socketio.listen(app);
    io.on('connection', function(socket) {
        console.log('Nguoi dung da ket noi !');

        socket.on('search user', function(username) {
            console.log('Tìm kiếm người dùng: ' + username);
            socket.emit('search user result', 'Tìm kiếm người dùng: ' + username);
        });

        socket.on('disconnect', function() {
            console.log('Nguoi dung ngat ket noi');
        });
    });
    return io;
};