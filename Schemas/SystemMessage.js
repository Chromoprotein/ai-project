const mongoose = require('mongoose');
const Schema = mongoose.Schema

const systemMessageSchema = new Schema({
  botName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  instructions: { // a component of the system message
    type: String,
    required: true,
  },
  traits: { // a component of the system message
    type: String,
    required: false
  },
  userInfo: { // a component of the system message
    type: String,
    required: false
  },
  avatar: { 
    type: String,
    required: false
  }
},{collection : 'systemMessages', timestamps:true});

module.exports = mongoose.model('SystemMessage', systemMessageSchema);