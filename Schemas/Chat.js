const mongoose = require('mongoose');
const Schema = mongoose.Schema

const chatSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  botId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SystemMessage'
  },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  category: {
    type: String,
    required: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},{collection : 'chats', timestamps:true});

module.exports = mongoose.model('Chat', chatSchema);