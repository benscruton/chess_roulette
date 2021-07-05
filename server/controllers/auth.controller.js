const {User} = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
  register: (req,rsp) => {
    req.body.email = req.body.email.toLowerCase();
    req.body.userNameLower = req.body.userName.toLowerCase();
    User.create(req.body)
      .then(data => {
        rsp.cookie("usertoken",jwt.sign({id:data._id}, process.env.JWT_KEY), {
          httpOnly:true,
          expires: new Date(Date.now() + 90000000000)
        }).json({
          msg:"success", 
          userLogged: {
            firstName: data.firstName, 
            lastName:data.lastName,
            userName: data.userName,
            email: data.email,
            _id: data._id
          }
        })
      })
      .catch( err => rsp.json(err.errors))
  },

  login: (req,rsp) => {
    User.findOne({$or: [
      {email:req.body.email.toLowerCase()},
      {userNameLower: req.body.email.toLowerCase()}
    ]})
      .then(data => {
        if (data === null) {
          rsp.json({error: "Invalid login attempt."})
        } else {
          bcrypt.compare(req.body.password,data.password)
            .then(isValid => {
              if (!isValid){
                rsp.json({error: "Invalid login attempt."});
                return;
              }
              rsp.cookie("usertoken",jwt.sign({id:data._id}, process.env.JWT_KEY), {
                httpOnly:true,
                expires: new Date(Date.now() + 90000000000)
              }).json({
                msg:"success", 
                userLogged: {
                  firstName: data.firstName, 
                  lastName:data.lastName,
                  userName: data.userName,
                  email: data.email,
                  _id: data._id
                }
              });
            })
            .catch(err => rsp.json({error: "Invalid login attempt."}))
        }
      })
      .catch(err => rsp.json({error: "Invalid login attempt."}))
  },

  logout: (req,rsp) => {
    rsp.clearCookie("usertoken");
    rsp.json({msg:"logged out"});
  },

  checkPasswordBeforeChange : (req, rsp) => {
    User.findOne({_id:req.body._id})
      .then(data => {
        if (data === null) {
          rsp.json({error: "Invalid user."});
          return;
        }
        bcrypt.compare(req.body.password, data.password)
          .then(isValid => {
            if (!isValid){
              rsp.json({category: "oldpw", error: "Invalid password."});
              return;
            }
            if(req.body.newPassword.length < 8){
              rsp.json({category: "newpw", error: "Password must be at least 8 characters."});
              return;
            }
            if(req.body.newPassword !== req.body.confirmPassword){
              rsp.json({category: "confirmpw", error: "Passwords don't match."});
              return;
            }
            // If old password is valid and the new passwords match:
            bcrypt.hash(req.body.newPassword,10)
              .then(hash => {
                User.updateOne({_id:data._id}, {password: hash}, {runValidators:true, new:true})
                  .catch(err => rsp.status(400).json({errors: err.errors}))
              })
              .catch(err => console.error({errors: err}));
            rsp.cookie("usertoken",jwt.sign({id:data._id}, process.env.JWT_KEY), {
              httpOnly:true,
              expires: new Date(Date.now() + 90000000000)
            }).json({msg:"Password updated!"}) 
          })
          .catch(err => rsp.json({error: "Invalid login attempt."}))
      })
      .catch(err => rsp.json({error: "Invalid login attempt."}))
  },

  checkIfExists: (req, rsp) => {
    let unavailable = {};
    User.findOne({email: req.body.email.toLowerCase()})
      .then(userWithEmail => {
        unavailable.email = (userWithEmail !== null && (req.body.userId !== userWithEmail._id.toString()));
        if(req.body.userName){
          User.findOne({userNameLower: req.body.userName.toLowerCase()})
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
  },

  demoLogin : (req, rsp) => {
    let demoUserName = req.body.userName;
    if(demoUserName !== "buckets" && demoUserName !== "barrels"){
      rsp.json({error: "Demo username not recognized."});
    }
    User.findOne({userName: demoUserName})
      .then(data => {
        rsp.cookie("usertoken",jwt.sign({id:data._id}, process.env.JWT_KEY), {
          httpOnly:true,
          expires: new Date(Date.now() + 90000000000)
        }).json({
          msg:"success", 
          userLogged: {
            firstName: data.firstName, 
            lastName:data.lastName,
            userName: data.userName,
            email: data.email,
            _id: data._id
          }
        });
      })
      .catch(err => rsp.json({error: err}))
    
  }
}