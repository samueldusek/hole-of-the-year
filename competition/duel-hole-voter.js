// Require .env file
require("dotenv").config({ path: "../.env" });

// Load installed packages
const mongoose = require("mongoose");
// const fs = require("fs");
const fs = require("fs/promises");

// Load models
const Hole = require("../models/hole");
const User = require("../models/user");
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

const findVoter = async () => {
  // Get all users that nominated particular hole

  const duelId = mongoose.Types.ObjectId("619536a9017a374acbb61e7e"); // <--- INSERT DUEL ID
  const holeId = "617d097e48d30e2ee83c297a"; // <--- INSERT HOLE ID

  const users = await User.find({
    "userDuels.duel": duelId,
  })
    .select("username email userDuels")
    .populate("userDuels");

  console.log(users.length);

  const fd = await fs.open("./files/duel-hole-voter.txt", "w");

  await fd.write(`Pro jamku hlasovali: \n`);

  let idx = 1;

  for (const user of users) {
    if (
      user.userDuels.some((userDuel) => userDuel.hole.toString() === holeId) &&
      user.userDuels.length === 1
    ) {
      await fd.write(`${idx}. ${user.username} - ${user.email} \n`);
      idx++;
    }
  }

  await fd.close();
};

findVoter().then(() => {
  db.close();
});
