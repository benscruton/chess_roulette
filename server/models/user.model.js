const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Required Field"],
    },
    lastName: {
        type: String,
        required: [true, "Required Field"],
    },
    userName: {
        type: String,
        required: [true, "Required Field"],
        minlength: [5, "Must be at least 5 characters long."],
        validate: {
            validator: val => /^[a-zA-Z0-9_]*$/.test(val),
            message: "Username can only contain numbers, letters, and underscores."
        }
    },
    email: {
        type: String,
        required: [true, "Required Field"],
        validate: {
            validator: val => /^([\w-\.]+@([\w-]+\.)+[\w-]+)?$/.test(val),
            message: "Invalid email."
        }
    },
    password: {
        type: String,
        required: [true, "Required Field"],
        minlength: [8, "Must be at least 8 characters long."]
    },
}, {timestamps:true});

UserSchema.virtual('confirmPassword')
    .get(() => this._confirmPassword)
    .set(value => this._confirmPassword = value);

UserSchema.pre('validate', function(next){
    if (this.password !== this.confirmPassword) {
        this.invalidate('confirmPassword', "Passwords do not match.")
    }
    next();
});

UserSchema.pre('save', function(next){
    bcrypt.hash(this.password,10)
    .then(hash => {
        this.password = hash;
        next();
    })
});

const User = new mongoose.model("User", UserSchema);

module.exports.User = User;
module.exports.UserSchema = UserSchema;