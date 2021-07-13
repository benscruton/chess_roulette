const router = require("express").Router();
const UserController = require('../controllers/user.controller');
const {authenticate} = require('../config/jwt.config');

router.route("/")
  .get(authenticate, UserController.index);
  
router.route("/:id")
  .get(authenticate, UserController.show)
  .put(authenticate, UserController.update)
  .delete(authenticate, UserController.destroy);

module.exports = router;