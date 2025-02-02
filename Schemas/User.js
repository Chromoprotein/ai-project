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
    },
    lastBotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemMessage',
        required: false
    },
    avatar: {
        type:String,
        required:false,
    },
    aboutMe: {
        type:String,
        required:false
    },
    interestsHobbies: {
        type:String,
        required:false
    },
    currentGoals: [
        {
            goal: { type: String, required: false },
            id: { type: Number, required: false }, 
        },
    ],
    currentMood: {
        type:String,
        required:false,
    },
    sharedWithBots: [
        {
            botId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'SystemMessage',
            },
            shareUsername: { type: Boolean, default: true },
            shareAboutMe: { type: Boolean, default: false },
            shareInterestsHobbies: { type: Boolean, default: false },
            shareCurrentMood: { type: Boolean, default: false },
            sharedGoals: [
                { type: Number } // Array of IDs of goals the user wants to share
            ]
        }
    ]
},{collection : 'users', timestamps:true})

module.exports = mongoose.model('User', userSchema)