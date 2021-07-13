const router = require("express").Router();
const LogRegController = require('../controllers/auth.controller');
const {authenticate} = require('../config/jwt.config');

router.route('/register').post(LogRegController.register);
router.route('/login').post(LogRegController.login);
router.route('/demologin').post(LogRegController.demoLogin);
router.route('/logout').get(authenticate, LogRegController.logout);
router.route('/checkpassword').post(authenticate, LogRegController.checkPasswordBeforeChange);
router.route('/checkifexists').post(LogRegController.checkIfExists);

module.exports = router;