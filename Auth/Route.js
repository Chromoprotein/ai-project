const express = require("express")
const router = express.Router()
const { register, login, userStatus, logout, updateUser, getUser } = require("./Auth")
const { userAuth } = require("../middleware/auth");

// The route and the method and function that follow
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/userStatus").get(userStatus)
router.route("/updateUser").put(userAuth, updateUser)
router.route("/getUser").get(userAuth, getUser)
router.route("/logout").post(logout)

module.exports = router