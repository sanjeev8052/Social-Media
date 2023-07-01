const express = require('express');
const { createUser, UserLogin, userFollow, getPostOfFollowing, LogoutUser, updatePassword, updateProfile, deleteMyProfile, myProfile, getUserProfile, getAllUer } = require('../controllers/user');
const { isAuthenticated } = require('../middlewares/auth');
const router = express.Router();

router.route("/user/new").post(createUser)
router.route("/user/login").post(UserLogin)
router.route("/follow/:id").post(isAuthenticated, userFollow)
router.route("/getPost").get(isAuthenticated, getPostOfFollowing)
router.route("/logout").get(LogoutUser)
router.route("/update/password").put(isAuthenticated, updatePassword)
router.route("/update/Profile").put(isAuthenticated, updateProfile)
router.route("/delete/me").delete(isAuthenticated, deleteMyProfile)
router.route("/profile/me").get(isAuthenticated, myProfile)
router.route("/getUser/:id").get(isAuthenticated, getUserProfile)
router.route("/getAllUser").get(isAuthenticated, getAllUer)



module.exports = router