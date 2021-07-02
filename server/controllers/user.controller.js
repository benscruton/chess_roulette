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
      .catch(err => rsp.status(404).json({errors: err.errors}));
  },
  destroy: (req,rsp) => {
    User.deleteOne({_id:req.params.id})
      .then(data => rsp.redirect(303, '/api/users'))
      .catch(err => rsp.status(404).json({errors: err.errors}))
  },
  checkIfExists: (req, rsp) => {
    console.log(req.body);
    let unavailable = {};
    User.findOne({email: req.body.email})
      .then(userWithEmail => {
        unavailable.email = (userWithEmail !== null && (req.body.userId !== userWithEmail._id.toString()));
        if(req.body.userName){
          User.findOne({userName: req.body.userName})
            .then(userWithUserName => {
              unavailable.userName = (userWithUserName !== null);
              rsp.json({unavailable});
            })
            .catch(err => rsp.status(404).json({errors: err.errors}));
        } else {
          rsp.json({unavailable});
        }
      })
      .catch(err => rsp.status(404).json({errors: err.errors}));
  }
}