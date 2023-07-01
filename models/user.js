const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt');
const Jwt = require("jsonwebtoken");
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name"]
    },
    avatar: {
        public_id: String,
        url: String,
    },
    email: {
        type: String,
        required: [true, "Please enter a email"],
        unique: [true, "Email is alrady exists "],
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,


})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {

        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
});

userSchema.methods.matchPassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

const jwt_secret = "lkslsdjosdlkjls";
userSchema.methods.genretToken = async function (password) {
    return Jwt.sign({ _id: this._id }, jwt_secret)
}

userSchema.methods.getResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(20).toString("hax")

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;

}
module.exports = mongoose.model("User", userSchema)