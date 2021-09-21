const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HoleSchema = new Schema({
  number: Number,
  length: Number,
  par: Number,
  image: {
    url: String,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  votes: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Hole", HoleSchema);
