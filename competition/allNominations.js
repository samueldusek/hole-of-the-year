// Require .env file
require("dotenv").config({ path: "../.env" });

// Load installed packages
const mongoose = require("mongoose");
// const fs = require("fs");
const fs = require("fs/promises");

// Load models
const Hole = require("../models/hole");

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

const countNominations = async () => {
  // Get all users that nominated particular hole

  const holes = await Hole.find().select("votes");

  let nominations = 0;
  holes.forEach((hole) => {
    nominations = nominations + hole.votes;
  });

  console.log(nominations);
};

countNominations().then(() => {
  db.close();
});
