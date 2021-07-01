const {User} = require("../models/user.model");


module.exports = {
    index : (req,res) => {
        User.find()
            .then(data => res.json({results:data}))
            .catch(err => res.status(404).json({errors: err.errors}))
    },
    show : (req,res) => {
        User.findOne({_id: req.params.id})
            .then(data => res.json({results:data}))
            .catch(err => res.status(404).json({errors: err.errors}))
    },
    update : (req,res) => {
        User.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true, new:true, useFindAndModify: false})
            .then(data => res.json({results:data}))
            .catch(err => res.status(404).json({errors: err.errors}))
    },
    destroy: (req,res) => {
        User.deleteOne({_id:req.params.id})
            .then(data => res.redirect(303, '/api/users'))
            .catch(err => res.status(404).json({errors: err.errors}))
    }
}