const express = require('express');
const { createPost, likeAndUnlikePost, deletePost, updateCaption, commentOnPost, deleteComment } = require('../controllers/post');
const { isAuthenticated } = require('../middlewares/auth');
const router = express.Router();

router.route("/upload/post").post(isAuthenticated,createPost)
router.route("/post/:id").post(isAuthenticated,likeAndUnlikePost)
router.route("/post/:id").delete(isAuthenticated,deletePost)
router.route("/post/:id").put(isAuthenticated,updateCaption)
router.route("/post/addComment/:id").put(isAuthenticated,commentOnPost)
router.route("/post/deleteComment/:id").delete(isAuthenticated,deleteComment)

module.exports = router

