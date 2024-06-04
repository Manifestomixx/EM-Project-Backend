const POST = require("../model/postModel");
const USER = require("../model/userModel")
const fs = require("fs");
const cloudinary = require("cloudinary").v2;


// this step is after postmodel from model 23-05-2024
//  create post function
const createPost = async (req, res) => {
    const { text } = req.body;
    const image = req.files ? req.files.imagePath : null;
    req.body.user = req.user.userId;
  // const {userId} = req.user
  
    if (!text && !image) {
      res
        .status(400)
        .json({
          success: false,
          message: "You must provide either text or an image",
        });
      return;
    }
  
    try {
      let imagePath = null;
      if (image) {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: "EM_posts",
        });
        console.log("cloudinary upload successful", result);
        if (result && result.secure_url) {
          imagePath = result.secure_url;
          // console.log("url for img:", imagePath);
          // remove the uploaded file from the server
          fs.unlinkSync(image.tempFilePath);
        } else {
          // console.log("cloudinary upload failed");
          res
            .status(500)
            .json({ success: false, message: "Failed to upload image" });
            return
        }
      }
      
      const post = new POST({text,imagePath, user: req.user.userId
      });
      //   req.body.user = userId
      await post.save();
      // Update timeline
      // const timelineUpdate = await getTimeline(req.user.userId, post._id);
      res.status(201).json({success:true,message:"post created successfully",post})
    } catch (error) {
      res.status(500).json(error.message)
    }
  };

// Timeline 27-05-2024
const getTimeline = async (req,res)=>{
    const {userId} = req.user
    try {
        const user = await USER.findById(userId).populate("following");
        const followingIds = user.following.map((fIdx)=> fIdx._id);
        followingIds.push(userId);

        const posts = await POST.find({user:{$in:followingIds}}).populate({path:"user",select:"userName profilePhoto"}).populate("comments.user","userName").sort({createdAt:-1});
        res.status(200).json({success:true,message:"timeline post",posts})
    } catch (error) {
        res.status(500).json(error.message)
    }
};

// like and dislike a post
const likePost = async(req,res)=>{
    const {userId} = req.user
    try {
        const post = await POST.findById(req.params.postId);
        if (!post){
            return res.status(404).json({error:"Post not found"});
        }


        if(post.likes.includes(userId)){
            post.likes.pull(userId);
            await post.save();
            return res.status(200).json({success:true, message: "Post unliked successfully",post});
        }else{
            post.likes.push(userId);
            await post.save();
            return res.status(200).json({success:true, message: "Post liked successfully",post});

        }
    } catch (error) {
       res.status(500).json({success:false, message: "Unable to like post"}) 
    }
};

// comments
const commentPost = async(req,res)=>{
    const {userId} = req.user
    try {
        const post = await POST.findById(req.params.postId);
        if (!post){
            return res.status(404).json({error:"Post not found"});

        }
       const comment = {user:userId, text: req.body.text};
       post.comments.push(comment);
       
       await post.save();
       res.status(201).json({success:true, message:"Comment added successfully",post})

    } catch (error) {
       res.status(500).json(error.message); 
    }
};

// get comments for a post
const getComments = async(req,res)=>{
    try {
      const post = await POST.findById(req.params.postId).populate('comments.user', 'userName');
      if (!post) {
        return res.status(404).json({ success:false,message: 'Post not found.' });
      }
  
      res.status(200).json({success:true,comments:post.comments});
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch comments.' });
    }
  };

  // get all posts by a user
const getPostsByUser = async(req,res)=>{
    const {userId} = req.user
  
    try {
      const post = await POST.find({user:userId}).populate({path:"user",select:"-password"});
      res.status(200).json({success:true,message:"users post",post})
    } catch (error) {
      res.status(500).json(error.message)
    }
  };

const updatePost = async(req,res)=>{
    const { userId } = req.user;
  const { bio, age, gender, location, occupation, x, linkedIn } =
    req.body;
}

module.exports = {
    createPost,
    getTimeline,
    likePost,
    commentPost,
    getComments,
    getPostsByUser
};