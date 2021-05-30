const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  text: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  votes: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
