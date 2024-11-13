const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type:String,
        unique:true,
        required:true
    },
    email: {
        type:String,
        unique:true,
        required:true
    },
    password: {
        type:String,
        minlength:6,
        required:true
    }
},{collection : 'users', timestamps:true})

module.exports = mongoose.model('User', userSchema)