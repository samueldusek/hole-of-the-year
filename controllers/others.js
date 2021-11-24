const User = require("../models/user");

module.exports.showLuckers = async (req, res) => {
  const users = await User.find({}).select("username userDuels");

  const filteredUsers = users.filter((user) => user.userDuels.length > 0);

  const luckers = [];

  for (const user of filteredUsers) {
    for (const duel of user.userDuels) {
      luckers.push({ username: user.username });
    }
  }

  res.render("others/luckers", {
    pageTitle: "Štístko - Jamka Roku 2021",
    luckers: luckers,
    numberOfCompetitors: filteredUsers.length,
    path: "/others/luckers",
  });
};
