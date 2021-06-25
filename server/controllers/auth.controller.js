const {User} = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
  register: (req,rsp) => {
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
    User.findOne({email:req.body.email})
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
    User.findOne({email:req.body.email})
      .then(data => {
        if (data === null) {
          rsp.json({error: "Invalid user."});
          return;
        }
        bcrypt.compare(req.body.password, data.password)
          .then(isValid => {
            if (!isValid){
              rsp.json({error: "Invalid password."});
              return;
            }
            if(req.body.newPassword !== req.body.confirmPassword){
              rsp.json({error: "Passwords don't match."});
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
  }
}