// Require .env file
require("dotenv").config({ path: "../.env" });

// Load installed packages
const mongoose = require("mongoose");

// Load models
const Hole = require("../models/hole");
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

const seedDb = async () => {
  // Get top 16 holes
  const holes = await Hole.find({ votes: { $gt: 0 } })
    .sort({ votes: "desc", lastVoteTimeStamp: "asc" })
    .limit(16);

  console.log(holes);

  const HAS_RANDOM_VOTES = true;
  const ONE_DAY_IN_MS = 86400000;
  const ONE_DAY_MINUS_MINUTE_IN_MS = 86340000;

  let startDate = new Date(process.env.DATE_PLAYOFF_START * 1000);

  for (let i = 0; i < 8; i++) {
    const duel = new Duel({
      startDate: startDate,
      endDate: new Date(startDate.getTime() + ONE_DAY_MINUS_MINUTE_IN_MS),
      round: i + 1,
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
    startDate = new Date(startDate.getTime() + ONE_DAY_IN_MS);
  }
};

seedDb().then(() => {
  db.close();
});
