const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DuelSchema = new Schema({
  startDate: Date,
  endDate: Date,
  phase: {
    type: String,
    default: "eight",
  },
  round: {
    type: Number,
    default: 0,
  },
  holesInDuel: [
    {
      hole: {
        type: Schema.Types.ObjectId,
        ref: "Hole",
      },
      votes: {
        type: Number,
        default: 0,
      },
      lastVoteTimeStamp: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model("Duel", DuelSchema);
