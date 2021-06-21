const GameController = require("../controllers/game.controller");
const {authenticate} = require("../config/jwt.config");

module.exports = (app) => {
    app.get('/api/games', GameController.index);
    app.post('/api/games', GameController.create);
    app.get('/api/games/:id', GameController.show);
    app.put('/api/games/:id', authenticate, GameController.update);
    app.put('/api/games/:gameId/addPlayerWhite/:userId', authenticate, GameController.addPlayerWhite);
    app.put('/api/games/:gameId/addPlayerBlack/:userId', authenticate, GameController.addPlayerBlack);
    app.put('/api/games/:gameId/removePlayerWhite/:userId', authenticate, GameController.removePlayerWhite);
    app.put('/api/games/:gameId/removePlayerBlack/:userId', authenticate, GameController.removePlayerBlack);
    app.delete('/api/games/:id', authenticate, GameController.destroy);
}

