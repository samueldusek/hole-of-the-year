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

const HAS_RANDOM_VOTES = true;
const ONE_DAY_MINUS_MINUTE_IN_MS = 86340000;
const ONE_DAY_IN_MS = 86400000;

const FIRST_DUEL_ROUND = 1;
const SECOND_DUEL_ROUND = FIRST_DUEL_ROUND + 1;
const NEXT_DUEL_ROUND = 9;
const NEXT_DUEL_START_DATE = new Date(
  process.env.DATE_PLAYOFF_START * 1000 + (NEXT_DUEL_ROUND - 1) * ONE_DAY_IN_MS
);

const seedDb = async () => {
  // Get duels
  const duels = [];
  duels.push(await Duel.findOne({ round: FIRST_DUEL_ROUND }));
  duels.push(await Duel.findOne({ round: SECOND_DUEL_ROUND }));

  const holes = [];

  duels.forEach((duel) => {
    if (duel.holesInDuel[0].votes > duel.holesInDuel[1].votes) {
      holes.push(duel.holesInDuel[0].hole);
    } else {
      holes.push(duel.holesInDuel[1].hole);
    }
  });

  const duel = new Duel({
    startDate: NEXT_DUEL_START_DATE,
    endDate: new Date(
      NEXT_DUEL_START_DATE.getTime() + ONE_DAY_MINUS_MINUTE_IN_MS
    ),
    round: NEXT_DUEL_ROUND,
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
