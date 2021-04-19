const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique:true
    },
    countryCode: {type: String},
    location: {type: String},
    dialCode: {type: String},
    phone: {
        type: String
    },
    isEmailVerified: {
        type: Number,
        default: 0
    },
    email: {
        type: String,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    isActive: {
        type: Number,
        required: true,
        default: 0
    },
    isOnline: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: Number,
        required: true,
        default: 1
    },
    lastLoggedIn: {
        type: Date,
        default: Date.now
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    timezone: {
        type: String,
        default: "Asia/Kolkata"
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    vCode: {
        type: String
    }
});


UserSchema.index({userName:1,email:1,phone:1,vCode:-1,location:-1})

module.exports = mongoose.model("Users", UserSchema);