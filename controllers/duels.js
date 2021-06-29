const Duel = require("../models/duel");
const Hole = require("../models/hole");

module.exports.showAllDuels = async (req, res) => {
  const duels = await Duel.find({});

  res.render("duels/index", {
    duels: duels,
    pageTitle: "Duely - Jamka Roku 2021",
  });
};

module.exports.showDuel = async (req, res) => {
  const { id } = req.params;

  const duel = await Duel.findById(id);

  res.render("duels/show", {
    duel: duel,
    pageTitle: `Duel #${duel.round} - Jamka Roku 2021`,
  });
};
