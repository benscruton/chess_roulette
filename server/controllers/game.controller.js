const Game = require("../models/game.model");
const {User} = require("../models/user.model");
const gameBoards = require("../GameBoards");
const gameSpecialInfo = require("../GameSpecialInfo");

const removePassword = user => {
  const {_id, firstName, lastName, userName, userNameLower, email, createdAt, updatedAt} = user;
  return {_id, firstName, lastName, userName, userNameLower, email, createdAt, updatedAt};
};

module.exports = {
  index : (req,rsp) => {
    Game.find()
      .then(data => rsp.json({results:data}))
      .catch(err => rsp.status(404).json({errors: err.errors}))
  },

  create : (req,rsp) => {
    const type = req.body.type;
    const boardStatus = gameBoards[type];
    const specialInfo = gameSpecialInfo[type](boardStatus);
    Game.create({type, boardStatus, specialInfo})
      .then(data => rsp.json({results:data}))
      .catch(err => {
        console.log(err);
        rsp.status(404).json({errors: err.errors})
      });
  },

  show : (req,rsp) => {
    Game.findOne({_id: req.params.id})
      .then(data => rsp.json({results:data}))
      .catch(err => rsp.status(404).json({errors: err.errors}));
  },

  update : (req,rsp) => {
    Game.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true, new:true, useFindAndModify: false})
      .then(data => rsp.json({results:data}))
      .catch(err => rsp.status(404).json({errors: err.errors}));
  },

  begin : (req, rsp) => {
    Game.findOne({_id: req.params.id})
      .then(game => {
        if(!game.playerWhite.length || !game.playerBlack.length){
          rsp.json({results: game, incomplete: true});
          return;
        }
        req.body = {begun: true};
        module.exports.update(req, rsp);
      })
      .catch( err => rsp.status(404).json({errors: err.errors}));
  },

  addPlayerWhite : (req, rsp) => {
    User.findOne({_id: req.params.userId})
      .then(data => {
        Game.findOneAndUpdate({_id: req.params.gameId},
          {$push: {playerWhite: removePassword(data)}},
          {new: true, useFindAndModify: false}
        )
          .then(data => rsp.json({results: data}))
          .catch(err => rsp.status(404).json({errors: err.errors}));
      })
      .catch(err => rsp.status(404).json({errors: err.errors}));
  },

  addPlayerBlack : (req, rsp) => {
    User.findOne({_id: req.params.userId})
      .then(data => {
        Game.findOneAndUpdate({_id: req.params.gameId},
          {$push: {playerBlack: removePassword(data)}},
          {new: true, useFindAndModify: false}
        )
          .then(data => rsp.json({results: data}))
          .catch(err => rsp.status(404).json({errors: err.errors}));
      })
      .catch(err => rsp.status(404).json({errors: err.errors}));
  },

  removePlayerWhite : (req, rsp) => {
    Game.findOneAndUpdate({_id:req.params.gameId}, {playerWhite: []}, {runValidators:true, new:true, useFindAndModify: false})
      .then(data => rsp.json({results:data}))
      .catch(err => rsp.status(404).json({errors: err.errors}));
  },

  removePlayerBlack : (req, rsp) => {
    Game.findOneAndUpdate({_id:req.params.gameId}, {playerBlack: []}, {runValidators:true, new:true, useFindAndModify: false})
      .then(data => rsp.json({results:data}))
      .catch(err => rsp.status(404).json({errors: err.errors}));
  },

  destroy: (req,rsp) => {
    Game.deleteOne({_id:req.params.id})
      .then(data => rsp.redirect(303, '/api/Games'))
      .catch(err => rsp.status(404).json({errors: err.errors}));
  }
}