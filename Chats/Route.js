const express = require("express");
const router = express.Router();
const { newChat, getChat, getChatList, getai, speech, newSystemMessage, getSystemMessages, getOneSystemMessage, generateBotAvatar, avatar } = require("./Chats");
const { userAuth } = require("../middleware/auth");

// The route and the method and function that follow
router.route("/newChat").post(userAuth, newChat);
router.route("/getChat").get(userAuth, getChat);
router.route("/getChatList").get(userAuth, getChatList);

router.route("/getai").post(userAuth, getai);
router.route("/speech").post(userAuth, speech);

router.route("/createBot").post(userAuth, newSystemMessage);
router.route("/getBots").get(userAuth, getSystemMessages);
router.route("/getBot").get(userAuth, getOneSystemMessage);

router.route("/generateBotAvatar").post(userAuth, generateBotAvatar);
router.route("/avatar").put(userAuth, avatar);

module.exports = router;
