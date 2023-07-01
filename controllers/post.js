const User = require('../models/user')
const Post = require('../models/post');

exports.createPost = async (req, res) => {
    try {
        const newPost = {
            caption: req.body.caption,
            imageUrl: {
                public_id: "string",
                url: "string",

            },
            woner: req.user._id,

        };
        const post = await Post.create(newPost)
        const user = await User.findById(req.user._id)


        user.posts.push(post._id)
        await user.save()

        res.status(201).json({ post })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.likeAndUnlikePost = async (req, res) => {

    const post = await Post.findById(req.params.id)
    try {


        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "post not found..." })
        }

        if (post.likes.includes(req.user._id)) {
            const index = post.likes.indexOf(req.user._id)
            post.likes.splice(index, 1)
            await post.save();

            return res
                .status(200)
                .json({ success: true, message: "post UnLiked" })

        } else {

            post.likes.push(req.user._id)
            await post.save();

            return res
                .status(200)
                .json({ success: true, message: "post Liked" })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.deletePost = async (req, res) => {

    try {

        const post = await Post.findById(req.params.id)
        if (!post) {
            return res
                .status(404)
                .json({ success: true, message: "post not found" })
        }

        if (post.woner.toString() !== req.user._id.toString()) {
            return res
                .status(404)
                .json({ success: false, message: "Unauthrized" })
        }

        await post.remove()

        const user = await User.findById(req.user._id)

        const index = user.posts.indexOf(req.params.id)

        user.posts.splice(index, 1)
        await user.save();
        return res
            .status(200)
            .json({ success: true, message: "post deleted" })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
exports.updateCaption = async (req, res) => {

    try {

        const post = await Post.findById(req.params.id)
        if (!post) {
            return res
                .status(404)
                .json({ success: true, message: "post not found" })
        }

        if (post.woner.toString() !== req.user._id.toString()) {
            return res
                .status(404)
                .json({ success: false, message: "Unauthrized" })
        }

        post.caption = req.body.caption
        await post.save();
        return res
            .status(200)
            .json({ success: true, message: "post updated" })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.commentOnPost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
        if (!post) {
            return res
                .status(404)
                .json({ success: true, message: "post not found" })
        }


        let commentIndex = -1;

        post.comments.forEach((item, index) => {
            if (item.user.toString() === req.user._id.toString()) {
                commentIndex = index
            }
        });


        if (commentIndex !== -1) {

            post.comments[commentIndex].comment = req.body.comment;

            await post.save();
            return res.status(200).json({
                success: true,
                message: "comment updated",
            })

        } else {
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment
            });
        }

        await post.save()

        return res.status(200).json({
            success: true,
            message: "comment added"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found .." })
        }

        if (post.woner.toString() === req.user._id.toString()) {
            if (req.body.commentId == undefined) {
                return res
                    .status(400)
                    .json({ success: false, message: "Comment Id is required" })
            }
            post.comments.forEach((item, index) => {
                if (item._id.toString() === req.body.commentId.toString()) {
                    return post.comments.splice(index, 1)
                }

            });
            await post.save();

            return res
                .status(200)
                .json({ success: true, message: " Selected comment has deleted" })


        } else {
            post.comments.forEach((item, index) => {
                if (item.user.toString() === req.user._id.toString()) {
                    return post.comments.splice(index, 1)
                }
            });
            await post.save();

            return res
                .status(200)
                .json({ success: true, message: " Your comment has deleted" })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

