const express = require("express");
const { createPost, getTimeline, likePost, commentPost, getComments, getPostsByUser } = require("../controllers/postController");
const router = express.Router();
const authMiddleware = require("../middleware/auth");


// create route
router.post('/create-post',authMiddleware,createPost);
// Timeline route
router.get('/timeline',authMiddleware,getTimeline);
// Post route
router.post('/like-post/:postId',authMiddleware,likePost);
// Comment route
router.post('/comment-post/:postId',authMiddleware,commentPost);
// Getting comment for a post
router.get("/comments/:postId",getComments);
// Getting all posts by user
router.get("/user-posts",authMiddleware,getPostsByUser);






module.exports = router;