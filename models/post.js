const { default: mongoose } = require("mongoose");
const User = require('./user')
const postSchema = new mongoose.Schema({
    caption: String,
    imageUrl: {
        public_id: String,
        url: String,
    },
    woner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    cretedAt: {
        type: Date,
        default: Date.now
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            comment: {
                type: String,
                require: true
            }
        }
    ],
})

module.exports = mongoose.model("Post", postSchema)