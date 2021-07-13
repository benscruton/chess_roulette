const {User} = require("../models/user.model");

module.exports = {
  index: (req,rsp) => {
    User.find()
      .then(fullData => {
        let data = fullData.map( user => {
          const {_id, firstName, lastName, userName, email, createdAt, updatedAt} = user;
          return {_id, firstName, lastName, userName, email, createdAt, updatedAt};
        });
        rsp.json({results:data})
      })
      .catch(err => rsp.status(404).json({errors: err.errors}))
  },
  show: (req,rsp) => {
    User.findOne({_id: req.params.id})
      .then(data => {
        const {_id, firstName, lastName, userName, email, createdAt, updatedAt} = data;
        data = {_id, firstName, lastName, userName, email, createdAt, updatedAt};
        rsp.json({results:data});
      })
      .catch(err => rsp.status(404).json({errors: err.errors}))
  },
  update: (req,rsp) => {
    User.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true, new:true, useFindAndModify: false})
      .then(data => rsp.json({results:data}))
      .catch(err => rsp.status(404).json({errors: err.errors}));
  },
  destroy: (req,rsp) => {
    User.deleteOne({_id:req.params.id})
      .then(data => rsp.redirect(303, '/api/users'))
      .catch(err => rsp.status(404).json({errors: err.errors}))
  },
}