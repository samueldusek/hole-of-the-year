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

  const duel = await Duel.findById(id).populate({
    path: "holesInDuel",
    populate: {
      path: "hole",
      populate: {
        path: "course",
      },
    },
  });

  res.render("duels/show", {
    round: duel.round,
    holeOne: duel.holesInDuel[0],
    holeTwo: duel.holesInDuel[1],
    pageTitle: `Duel #${duel.round} - Jamka Roku 2021`,
  });
};
