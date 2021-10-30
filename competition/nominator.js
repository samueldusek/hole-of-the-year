// Require .env file
require("dotenv").config({ path: "../.env" });

// Load installed packages
const mongoose = require("mongoose");
// const fs = require("fs");
const fs = require("fs/promises");

// Load models
const Hole = require("../models/hole");
const User = require("../models/user");
const Course = require("../models/course");

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

const findNominator = async () => {
  // Get all users that nominated particular hole

  const holeId = mongoose.Types.ObjectId("616efb01d4be0117f0435fc4"); // <--- INSERT HOLE ID

  const users = await User.find({ nominatedHoles: holeId }).select("username");
  const hole = await Hole.findById(holeId).populate("course");

  const fd = await fs.open("./files/nominators.txt", "w");

  await fd.write(`Jamka #${hole.number} - ${hole.course.name} \n`);
  await fd.write(`Počet nominačních hlasů: ${hole.votes} \n\n`);

  await fd.write(`Jamku nominovali: \n`);

  let idx = 1;

  for (const user of users) {
    await fd.write(`${idx}. ${user.username} \n`);
    idx++;
  }

  await fd.close();
};

findNominator().then(() => {
  db.close();
});
