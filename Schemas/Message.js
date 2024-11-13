const mongoose = require('mongoose');
const Schema = mongoose.Schema

const messageSchema = new Schema({
  role: { // bot or user
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }
},{collection : 'messages', timestamps:true});

module.exports = mongoose.model('Message', messageSchema);