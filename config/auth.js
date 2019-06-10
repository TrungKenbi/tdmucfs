// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : process.env.APP_ENV == 'production' ?
    {
        'clientID'      : '1287536914734391',
        'clientSecret'  : '44b88811d922ceb13f464d36d9a3bb94',
        'callbackURL'   : 'https://tdmucfs.herokuapp.com/auth/facebook/callback',
        'profileFields' : ['id', 'name']
    } : {
        'clientID'      : '371818743678815',
        'clientSecret'  : 'deadb152cfba3613b43c8e00875c8a9c',
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback',
        'profileFields' : ['id', 'name']
    }
};