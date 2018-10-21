var {User} = require('./../models/user.js')
// this authenticate is a middleware and is used in the server.js app.get('/users/me') routh. next() is used to pass 
// the middleware function continiuation to the app.get('/users/me') in the server.js.
var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send('token is invalid or the user is not found');
    });
};

module.exports = {authenticate}; 