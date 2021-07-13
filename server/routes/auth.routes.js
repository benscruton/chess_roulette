const router = require("express").Router();
const LogRegController = require('../controllers/auth.controller');
const {authenticate} = require('../config/jwt.config');

router.route('/api/register').post(LogRegController.register);
router.route('/api/login').post(LogRegController.login);
router.route('/api/demologin').post(LogRegController.demoLogin);
router.route('/api/logout').get(authenticate, LogRegController.logout);
router.route('/api/checkpassword').post(authenticate, LogRegController.checkPasswordBeforeChange);
router.route('/api/checkifexists').post(LogRegController.checkIfExists);

module.exports = router;