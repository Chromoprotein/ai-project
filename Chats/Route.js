const express = require("express")
const router = express.Router()
const { newChat, addMessage, getChat, getChatList } = require("./Chats")
const { userAuth } = require("../middleware/auth")

// The route and the method and function that follow
router.route("/newChat").post(userAuth, newChat)
router.route("/addMessage").post(userAuth, addMessage)
router.route("/getChat").get(userAuth, getChat)
router.route("/getChatList").get(userAuth, getChatList)

module.exports = router