const Post = require('../models/post');
const { findById } = require('../models/user');
const User = require('../models/user')


exports.createUser = async (req, res) => {
    try {
        const {name, email , password} = req.body
        let user = await User.findOne({ email });
        console.log(user)
        if (user) {
            return res
                .status(404)
                .json({ success: false, message: "user allrady exists" })
        }
        user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: "public_id",
                url: "url"
            }
        })
        const option = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        const token = await user.genretToken()
        res.status(201).cookie("token", token, option).json({ success: true, user, token })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}







exports.UserLogin = async (req, res) => {
    

    try {
        const {email , password} = req.body

        let user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "user dose not exist " })
        }

        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
            return res
                .status(404)
                .json({ success: false, message: "password dose not match " })

        }
        const option = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        const token = await user.genretToken()
        res.status(200).cookie("token", token, option).json({ success: true, user, token })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }

}

exports.userFollow = async (req, res) => {
    try {
        const userToFollwo = await User.findById(req.params.id)
        const loggedInUser = await User.findById(req.user.id)

        if (!userToFollwo) {
            return res
                .status(404)
                .json({ success: false, message: "User Not Found" });
        }
        if (loggedInUser.following.includes(userToFollwo.id)) {
            const indexOfFollowing = loggedInUser.following.indexOf(userToFollwo._id)
            const indexOfFollowers = userToFollwo.followers.indexOf(loggedInUser._id)

            loggedInUser.following.splice(indexOfFollowing, 1);
            userToFollwo.followers.splice(indexOfFollowers, 1);

            await loggedInUser.save();
            await userToFollwo.save();

            return res
                .status(200)
                .json({ success: true, message: "User UnFollowed" })

        } else {
            loggedInUser.following.push(userToFollwo._id)
            userToFollwo.followers.push(req.user._id)
            await userToFollwo.save();
            await loggedInUser.save();

            return res
                .status(200)
                .json({ success: true, message: "User Followed" })
        }

    } catch (error) {
        return res
            .status(500)
            .json({ error: error.message });
    }
}

exports.getPostOfFollowing = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
        const posts = await Post.find({ woner: { $in: user.following } }).populate("woner likes")

        res.status(201).json({
            success: true,
            posts:posts.reverse(),
        })

    } catch (error) {
        return res
            .status(500)
            .json({ error: error.message });
    }

}

exports.LogoutUser = async (req, res) => {
    try {
        res
            .status(200)
            .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
            .json({ success: true, message: "Logout" })
    } catch (error) {
        res
            .status(500)
            .json({ success: false, Error: error.message })
    }

}

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");

        const { oldPassword, newPassword } = req.body

        if (!oldPassword & !newPassword) {
            return res
                .status(400)
                .json({ success: false, message: "Pleas provide oldPassword and newPassword" })
        }

        const isMatch = await user.matchPassword(oldPassword)
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "oldPassword is Incorrect " })
        }

        user.password = newPassword
        await user.save();
        res
            .status(200)
            .json({ success: true, message: "password updated.." })
    } catch (error) {
        return res
            .status(500)
            .json({ error: error.message });
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const { email, name } = req.body

        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }

        await user.save();
        res
            .status(200)
            .json({ success: true, message: "Profile updated.." })

    } catch (error) {
        return res
            .status(500)
            .json({ error: error.message });
    }
}

exports.deleteMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const posts = user.posts;
        const userId = user._id;
        const followers = user.followers;
        const following = user.following;
        await user.remove();

        // Logout User after deleting Profile

        res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })

        // Delete all post of user
        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);

            await post.remove();

        }

        //removing user for followers following
        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i])

            const index = await follower.following.indexOf(userId)
            follower.following.splice(index, 1)
            await follower.save();
        }
        //removing user for followers following

        for (let i = 0; i < following.length; i++) {
            const follows = await User.findById(following[i])

            const index = follows.followers.indexOf(userId)
            follows.followers.splice(index, 1)
            await follows.save();
        }

        res.status(200)
            .json({ success: true, message: "Profile Deleted..." })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("posts")
        res
            .status(200)
            .json({ success: true, user })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts")
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User Not found" })
        }
        res
            .status(200)
            .json({ success: true, user })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.getAllUer = async (req, res) => {
    try {
        const users = await User.find({})
        res
            .status(200)
            .json({ success: true, users })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.forgotPassword = async () => {
    try {
        const user = await User.findOne({ email: req.pody.email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "user not found " })
        }
        const resetPasswordToken = user.getResetPasswordToken();
        await user.save();
        const resetUrl = `${req.protocl}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`;
        const message = `reset Password by clicking on the link below: /n/n ${resetUrl}`

        try {
            await email({
                email: user.email,
                subject: "Reset Password",
                message
            })

            res.status(200).json({success:true, message :`Email sent  to ${user.email}`})
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
             await user.save();

             res
             .status(500)
             .json({success:false  ,error:error.message })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}