// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1287536914734391', // your App ID
        'clientSecret'  : '44b88811d922ceb13f464d36d9a3bb94', // your App Secret
        'callbackURL'   : (process.env.APP_ENV == 'production' ?
            'https://tdmucfs.herokuapp.com' :
            'http://localhost:8080') + '/auth/facebook/callback',
        'profileFields' : ['id', 'name'] // For requesting permissions from Facebook API
    }

};