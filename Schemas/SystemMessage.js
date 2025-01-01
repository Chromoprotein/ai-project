const mongoose = require('mongoose');
const Schema = mongoose.Schema

const systemMessageSchema = new Schema({
  systemMessage: { // The full processed system message that is used in chats
    type: String,
    required: true
  },
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
  }, // a component of the system message
  userInfo: {
    type: String,
    required: false
  },
},{collection : 'systemMessages', timestamps:true});

module.exports = mongoose.model('SystemMessage', systemMessageSchema);