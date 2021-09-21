const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  name: String,
  slug: String,
  type: String,
  region: String,
  folderId: String,
  url: String,
  company: {
    name: String,
    url: String,
  },
  image: {
    url: String,
    author: {
      name: String,
      tag: String,
      url: String,
    },
  },
  holes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Hole",
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

// Methods to count number of holes and the overall layout length and par must be added.
CourseSchema.virtual("numberOfHoles").get(function () {
  return this.holes.length;
});

CourseSchema.virtual("layoutLength").get(function () {
  let length = 0;
  for (let hole of this.holes) {
    length += hole.length;
  }
  return length;
});

CourseSchema.virtual("layoutPar").get(function () {
  let par = 0;
  for (let hole of this.holes) {
    par += hole.par;
  }
  return par;
});

module.exports = mongoose.model("Course", CourseSchema);
