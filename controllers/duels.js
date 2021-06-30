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

  const startDateString = `${startDate.getDate()}. ${
    startDate.getMonth() + 1
  }. ${startDate.getFullYear()} v ${startDate.getHours()}:${startDate.getMinutes()}`;

  const endDateString = `${endDate.getDate()}. ${
    endDate.getMonth() + 1
  }. ${endDate.getFullYear()} v ${endDate.getHours()}:${endDate.getMinutes()}`;

  console.log(endDateString);

  res.render("duels/show", {
    startDate: startDateString,
    endDate: endDateString,
    isFinished: today.getTime() > endDate.getTime(),
    isOngoing:
      startDate.getTime() < today.getTime() &&
      today.getTime() < endDate.getTime(),
    isAboutToStart: today.getTime() < startDate.getTime(),
    round: duel.round,
    holeOne: duel.holesInDuel[0],
    holeOnePercentage: holeOnePercentage,
    holeTwo: duel.holesInDuel[1],
    holeTwoPercentage: holeTwoPercentage,
    pageTitle: `Duel #${duel.round} - Jamka Roku 2021`,
  });
};
