const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  date: Date,
  text: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  votes: {
    type: Number,
    default: 0,
  },
  lastVoteTimeStamp: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
