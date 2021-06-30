const LogRegController = require('../controllers/auth.controller');
const UserController = require('../controllers/user.controller');
const {authenticate} = require('../config/jwt.config');

module.exports = (app) => {
    app.post('/api/register', LogRegController.register);
    app.post('/api/login', LogRegController.login);
    app.post('/api/demologin', LogRegController.demoLogin);
    app.get('/api/users', authenticate, UserController.index);
    app.get('/api/users/:id', authenticate, UserController.show);
    app.put('/api/users/:id', authenticate, UserController.update);
    app.delete('/api/users/:id',authenticate, UserController.destroy);
    app.get('/api/logout', authenticate, LogRegController.logout);
    app.post('/api/checkpassword', authenticate, LogRegController.checkPasswordBeforeChange);
}