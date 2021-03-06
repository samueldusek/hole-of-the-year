// Require .env file
require("dotenv").config({ path: "../.env" });

// Load installed packages
const mongoose = require("mongoose");

// Load models
const Duel = require("../models/duel");

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const HAS_RANDOM_VOTES = false; // <--- SET: true, false
const DUEL_DURATION_TIME = process.env.DUEL_DURATION_TIME * 1000;
const DUEL_START_END_GAP = process.env.DUEL_START_END_GAP * 1000;
const DUEL_DURATION_TIME_REAL = DUEL_DURATION_TIME - DUEL_START_END_GAP;

const NEXT_DUEL_ROUND = 15; // <--- SET: 9, 10, 11, 12, 13, 14, 15

const DUEL_ROUNDS = {
  9: 1,
  10: 3,
  11: 5,
  12: 7,
  13: 9,
  14: 11,
  15: 13,
};

const getDuelPhase = (round) => {
  if (round >= 9 && round <= 12) {
    return "quarter";
  }
  if (round === 13 || round === 14) {
    return "semi";
  }
  if (round === 15) {
    return "final";
  }
};

const FIRST_DUEL_ROUND = DUEL_ROUNDS[NEXT_DUEL_ROUND.toString()];
const SECOND_DUEL_ROUND = FIRST_DUEL_ROUND + 1;
const NEXT_DUEL_START_DATE = new Date(
  process.env.DATE_PLAYOFF_START * 1000 +
    (NEXT_DUEL_ROUND - 1) * DUEL_DURATION_TIME
);
const NEXT_DUEL_PHASE = getDuelPhase(NEXT_DUEL_ROUND);

const seedDb = async () => {
  // Get duels
  const duels = [];
  duels.push(await Duel.findOne({ round: FIRST_DUEL_ROUND }));
  duels.push(await Duel.findOne({ round: SECOND_DUEL_ROUND }));

  const holes = [];

  duels.forEach((duel) => {
    if (
      duel.holesInDuel[0].votes > duel.holesInDuel[1].votes ||
      (duel.holesInDuel[0].votes === duel.holesInDuel[1].votes &&
        duel.holesInDuel[0].lastVoteTimeStamp <
          duel.holesInDuel[1].lastVoteTimeStamp)
    ) {
      holes.push(duel.holesInDuel[0].hole);
    } else {
      holes.push(duel.holesInDuel[1].hole);
    }
  });

  const duel = new Duel({
    startDate: NEXT_DUEL_START_DATE,
    endDate: new Date(NEXT_DUEL_START_DATE.getTime() + DUEL_DURATION_TIME_REAL),
    round: NEXT_DUEL_ROUND,
    phase: NEXT_DUEL_PHASE,
  });
  duel.holesInDuel.push({
    hole: holes.shift(),
    votes: HAS_RANDOM_VOTES ? Math.floor(Math.random() * 300) : 0,
  });
  duel.holesInDuel.push({
    hole: holes.pop(),
    votes: HAS_RANDOM_VOTES ? Math.floor(Math.random() * 300) : 0,
  });
  await duel.save();
};

seedDb().then(() => {
  db.close();
});
