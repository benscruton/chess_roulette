const router = require("express").Router();
const GameController = require("../controllers/game.controller");
const {authenticate} = require("../config/jwt.config");

router.route("/")
  .get(GameController.index)
  .post(GameController.create);

router.route("/:id")
  .get(GameController.show)
  .put(authenticate, GameController.update)
  .delete(authenticate, GameController.destroy);

router.route("/:id/begin")
  .put(authenticate, GameController.begin);

router.route('/:gameId/addPlayerWhite/:userId')
  .put(authenticate, GameController.addPlayerWhite);
router.route('/:gameId/addPlayerBlack/:userId')
  .put(authenticate, GameController.addPlayerBlack);

router.route('/:gameId/removePlayerWhite/:userId')
  .put(authenticate, GameController.removePlayerWhite);
router.route('/:gameId/removePlayerBlack/:userId')
  .put(authenticate, GameController.removePlayerBlack);

module.exports = router;