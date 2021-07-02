const Duel = require("../models/duel");
const Hole = require("../models/hole");
const { getCzechDate, getCzechDatePlusTime } = require("../utils/helpers");

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

  const today = new Date().getTime();

  const duelsToDisplay = duels.map((duel) => {
    return {
      ...duel._doc,
      startDate: getCzechDate(duel.startDate),
      endDate: getCzechDate(duel.endDate),
      isFinished: today > duel.endDate.getTime(),
      isOngoing:
        duel.startDate.getTime() < today && today < duel.endDate.getTime(),
      isAboutToStart: today < duel.startDate.getTime(),
    };
  });

  console.log(duelsToDisplay);

  res.render("duels/index", {
    duels: duelsToDisplay,
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
    startDate: getCzechDatePlusTime(startDate),
    endDate: getCzechDatePlusTime(endDate),
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
