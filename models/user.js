const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  nominatedHoles: [
    {
      type: Schema.Types.ObjectId,
      ref: "Hole",
    },
  ],
  userDuels: [
    {
      duel: { type: Schema.Types.ObjectId, ref: "Duel" },
      hole: { type: Schema.Types.ObjectId, ref: "Hole" },
    },
  ],
  likedComments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
