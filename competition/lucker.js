// Require .env file
require("dotenv").config({ path: "../.env" });

// Load installed packages
const mongoose = require("mongoose");
// const fs = require("fs");
const fs = require("fs/promises");

// Load models
const User = require("../models/user");

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

const printLuckers = async () => {
  // Get all users that nominated particular hole

  const users = await User.find({}).select("username userDuels");

  const filteredUsers = users.filter((user) => user.userDuels.length > 0);

  const numberOfTickets = filteredUsers.reduce((tickets, user) => {
    return tickets + user.userDuels.length;
  }, 0);

  const fd = await fs.open("./files/luckers.txt", "w");

  await fd.write(`Štístko \n`);
  await fd.write(`Počet soutěžících: ${filteredUsers.length} \n`);
  await fd.write(`Počet losů: ${numberOfTickets} \n`);

  await fd.write(`Losy: \n\n`);

  for (const user of filteredUsers) {
    for (const duel of user.userDuels) {
      await fd.write(`${user.username} \n`);
    }
  }

  await fd.close();

  console.log(filteredUsers);
};

printLuckers().then(() => {
  db.close();
});
