const Game = require("../models/game.model");
const {User} = require("../models/user.model");


module.exports = {
    index : (req,rsp) => {
        Game.find()
            .then(data => rsp.json({results:data}))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },
    create : (req,rsp) => {
        Game.create(req.body)
            .then(data => rsp.json({results:data}))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },
    show : (req,rsp) => {
        Game.findOne({_id: req.params.id})
            .then(data => rsp.json({results:data}))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },
    update : (req,rsp) => {
        Game.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true, new:true, useFindAndModify: false})
            .then(data => rsp.json({results:data}))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },
    addPlayerWhite : (req, rsp) => {
        User.findOne({_id: req.params.userId})
            .then(data => {
                Game.findOneAndUpdate({_id: req.params.gameId},
                    {$push: {playerWhite: data}}, {new: true, useFindAndModify: false})
                    .then(data => rsp.json({results: data}))
                    .catch(err => rsp.status(404).json({errors: err.errors}));
            })
            .catch(err => rsp.status(404).json({errors: err.errors}));
    },
    addPlayerBlack : (req, rsp) => {
        User.findOne({_id: req.params.userId})
            .then(data => {
                Game.findOneAndUpdate({_id: req.params.gameId},
                    {$push: {playerBlack: data}}, {new: true, useFindAndModify: false})
                    .then(data => rsp.json({results: data}))
                    .catch(err => rsp.status(404).json({errors: err.errors}));
            })
            .catch(err => rsp.status(404).json({errors: err.errors}));
    },

    removePlayerWhite : (req, rsp) => {
        // Game.findOneAndUpdate({_id:req.params.gameId}, {$pull: {playerWhite: {_id: req.params.userId}}}, {runValidators:true, new:true, useFindAndModify: false})
        Game.findOneAndUpdate({_id:req.params.gameId}, {playerWhite: []}, {runValidators:true, new:true, useFindAndModify: false})
            .then(data => rsp.json({results:data}))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },

    removePlayerBlack : (req, rsp) => {
        // Game.findOneAndUpdate({_id:req.params.gameId}, {$pull: {playerBlack: {_id: req.params.userId}}}, {runValidators:true, new:true, useFindAndModify: false})
        Game.findOneAndUpdate({_id:req.params.gameId}, {playerBlack: []}, {runValidators:true, new:true, useFindAndModify: false})
            .then(data => rsp.json({results:data}))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },

    destroy: (req,rsp) => {
        Game.deleteOne({_id:req.params.id})
            .then(data => rsp.redirect(303, '/api/Games'))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    }
}