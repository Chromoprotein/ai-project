const mongoose = require('mongoose');
const Schema = mongoose.Schema

const systemMessageSchema = new Schema({
  systemMessage: {
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
  }
},{collection : 'systemMessages', timestamps:true});

module.exports = mongoose.model('SystemMessage', systemMessageSchema);