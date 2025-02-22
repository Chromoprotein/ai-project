const express = require("express");
const router = express.Router();
const { newChat, getChat, getChatList, getai, speech, newSystemMessage, editBot, deleteBot, generateAvatar, saveAvatar, setLastBotId, getLastBot, clearAvatar, forgetBot, getAllBots, placeholderAvatar } = require("./Chats");
const { userAuth } = require("../middleware/auth");

// The route and the method and function that follow
router.route("/newChat").post(userAuth, newChat);
router.route("/getChat").get(userAuth, getChat);
router.route("/getChatList").get(userAuth, getChatList);

router.route("/getai").post(userAuth, getai);
router.route("/speech").post(userAuth, speech);

router.route("/getAllBots").get(userAuth, getAllBots);

router.route("/createBot").post(userAuth, newSystemMessage);
router.route("/editBot").post(userAuth, editBot);
router.route("/deleteBot/:botId").delete(userAuth, deleteBot);

router.route("/getLastBot").get(userAuth, getLastBot);
router.route("/setLastBotId").post(userAuth, setLastBotId);
router.route("/forgetBot").patch(userAuth, forgetBot);

router.route("/generateAvatar").post(userAuth, generateAvatar);
router.route("/saveAvatar").put(userAuth, saveAvatar);
router.route("/clearAvatar/:botId?").patch(userAuth, clearAvatar);

router.route("/placeholderAvatar").put(userAuth, placeholderAvatar);

module.exports = router;
