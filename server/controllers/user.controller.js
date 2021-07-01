const {User} = require("../models/user.model");


module.exports = {
    index: (req,rsp) => {
        User.find()
            .then(data => rsp.json({results:data}))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },
    show: (req,rsp) => {
        User.findOne({_id: req.params.id})
            .then(data => rsp.json({results:data}))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },
    update: (req,rsp) => {
        User.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true, new:true, useFindAndModify: false})
            .then(data => rsp.json({results:data}))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },
    destroy: (req,rsp) => {
        User.deleteOne({_id:req.params.id})
            .then(data => rsp.redirect(303, '/api/users'))
            .catch(err => rsp.status(404).json({errors: err.errors}))
    },
    checkIfExists: (req, rsp) => {
        User.findOne({[req.body.category]: req.body.value})
            .then(data => {
                if(data === null || data._id.toString() === req.body.userId){
                    rsp.json({userExists: false});
                } else {
                    rsp.json({userExists: {[req.body.category]: true}});
                }
            })
            .catch(err => rsp.status(404).json({errors: err.errors}));
    }
}