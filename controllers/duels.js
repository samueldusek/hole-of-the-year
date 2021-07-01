const Duel = require("../models/duel");
const Hole = require("../models/hole");
const { getCzechDate } = require("../utils/helpers");

module.exports.showAllDuels = async (req, res) => {
  const duels = await Duel.find({}).populate({
    path: "holesInDuel",
    populate: {
      path: "hole",
      populate: {
        path: "course",
      },
    },
  });

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

  let holeOnePercentage = 50;
  let holeTwoPercentage = 50;

  if (duel.holesInDuel[0].votes !== duel.holesInDuel[1].votes) {
    const totalVotes = duel.holesInDuel[0].votes + duel.holesInDuel[1].votes;
    holeOnePercentage = Math.floor(
      (100 * duel.holesInDuel[0].votes) / totalVotes
    );
    holeTwoPercentage = 100 - holeOnePercentage;
  }

  const startDate = new Date(duel.startDate);
  const endDate = new Date(duel.endDate);
  const today = new Date();

  res.render("duels/show", {
    startDate: getCzechDate(startDate),
    endDate: getCzechDate(endDate),
    isFinished: today.getTime() > endDate.getTime(),
    isOngoing:
      startDate.getTime() < today.getTime() &&
      today.getTime() < endDate.getTime(),
    isAboutToStart: today.getTime() < startDate.getTime(),
    round: duel.round,
    holeOne: duel.holesInDuel[0],
    holeOnePercentage: holeOnePercentage,
    holeOneIsWinner: duel.holesInDuel[0].votes > duel.holesInDuel[1].votes,
    holeTwo: duel.holesInDuel[1],
    holeTwoPercentage: holeTwoPercentage,
    holeTwoIsWinner: duel.holesInDuel[0].votes < duel.holesInDuel[1].votes,
    pageTitle: `Duel #${duel.round} - Jamka Roku 2021`,
  });
};
