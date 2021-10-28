const Duel = require("../models/duel");
const Hole = require("../models/hole");
const User = require("../models/user");
const format = require("date-fns/format");

module.exports.showAllDuels = async (req, res) => {
  try {
    // Fetch all duels from the db
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
    const playOffStartDate = process.env.DATE_PLAYOFF_START;
    const DUEL_DURATION_TIME = process.env.DUEL_DURATION_TIME;

    // "eight", "quarter", "semi", "final"
    const formattedDuels = [];
    const bracketDuels = {
      eight: [],
      quarter: [],
      semi: [],
      final: [],
    };
    const bracketStartDates = {
      eight: [],
      quarter: [],
      semi: [],
      final: [],
    };
    let heroDuel;

    for (let i = 0; i < 16; i++) {
      const startDate = format(
        new Date(playOffStartDate * 1000 + i * (DUEL_DURATION_TIME * 1000)),
        "d.M.y"
      );
      if (i < 8) {
        bracketStartDates.eight.push(startDate);
      } else if (i < 12) {
        bracketStartDates.quarter.push(startDate);
      } else if (i < 14) {
        bracketStartDates.semi.push(startDate);
      } else {
        bracketStartDates.final.push(startDate);
      }
    }

    // Format duels if any duels fetched
    if (duels) {
      duels.forEach((duel) => {
        const startDate = format(duel.startDate, "d.M., HH:mm");
        const isOngoing =
          duel.startDate.getTime() < today && today < duel.endDate.getTime();
        const isFinished = today > duel.endDate.getTime();
        const isAboutToStart = today < duel.startDate.getTime();
        formattedDuels.push({
          ...duel._doc,
          startDate,
          isOngoing,
          isFinished,
          isAboutToStart,
          endDate: format(duel.endDate, "d.M.y"),
        });
        const bracketDuel = {
          ...duel._doc,
          isOngoing,
          isFinished,
          isAboutToStart,
        };
        if (duel.phase === "eight") bracketDuels.eight.push(bracketDuel);
        if (duel.phase === "quarter") bracketDuels.quarter.push(bracketDuel);
        if (duel.phase === "semi") bracketDuels.semi.push(bracketDuel);
        if (duel.phase === "final") bracketDuels.final.push(bracketDuel);
      });
      heroDuel = duels.find(
        (duel) =>
          duel.startDate.getTime() < today && duel.endDate.getTime() > today
      );
    }

    res.render("duels/index", {
      heroDuel,
      bracketDuels,
      bracketStartDates,
      duels: formattedDuels,
      pageTitle: "Duely - Jamka Roku 2021",
      path: "/duels/index",
    });
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkus prosím zobrazit duely znovu."
    );
    return res.redirect("/courses");
  }
};

module.exports.showDuel = async (req, res) => {
  const { id: duelId } = req.params;

  try {
    // Fetch duels from the db
    const duel = await Duel.findById(duelId).populate({
      path: "holesInDuel",
      populate: {
        path: "hole",
        populate: {
          path: "course",
        },
      },
    });
    if (!duel) {
      req.flash("error", `Duel s id: ${duelId} neexistuje. Vyber prosím duel jiný.`);
      return res.redirect(`/duels`);
    }

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
      startDate: format(startDate, "d.M.y, HH:mm"),
      endDate: format(endDate, "d.M.y, HH:mm"),
      isFinished: today.getTime() > endDate.getTime(),
      isOngoing:
        startDate.getTime() < today.getTime() &&
        today.getTime() < endDate.getTime(),
      isAboutToStart: today.getTime() < startDate.getTime(),
      duelId: duel._id,
      round: duel.round,
      holeOne: duel.holesInDuel[0],
      holeOnePercentage: holeOnePercentage,
      holeOneIsWinner: (duel.holesInDuel[0].votes > duel.holesInDuel[1].votes) || ((duel.holesInDuel[0].votes === duel.holesInDuel[1].votes) && (duel.holesInDuel[0].lastVoteTimeStamp < duel.holesInDuel[1].lastVoteTimeStamp)),
      holeTwo: duel.holesInDuel[1],
      holeTwoPercentage: holeTwoPercentage,
      holeTwoIsWinner: (duel.holesInDuel[0].votes < duel.holesInDuel[1].votes) || ((duel.holesInDuel[0].votes === duel.holesInDuel[1].votes) && (duel.holesInDuel[0].lastVoteTimeStamp > duel.holesInDuel[1].lastVoteTimeStamp)),
      pageTitle: `Duel #${duel.round} - Jamka Roku 2021`,
      path: "/duels/show",
    });
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkus prosím provést svou akci znovu."
    );
    return res.redirect("/duels");
  }
};

module.exports.voteInDuel = async (req, res) => {
  // Get duel id from request params
  const { id: duelId } = req.params;
  // Get user and hole id from request body
  const { userId, holeId } = req.body;

  // Check for all ids
  if (!userId || !holeId || !duelId) {
    let errorMsg = "";
    if (!userId) errorMsg = "Nelze přidat hlas bez uživatelského id.";
    if (!holeId) errorMsg = "Nelze přidat hlas bez id jamky.";
    if (!duelId) errorMsg = "Nelze přidat hlas bez id duelu.";
    req.flash("error", errorMsg);
    return res.redirect("/duels");
  }

  try {
    // Fetch the duel from database
    const duel = await Duel.findById(duelId).populate({
      path: "holesInDuel",
      populate: {
        path: "hole",
      },
    });
    if (!duel) {
      req.flash("error", "Nelze hlasovat v duelu, který neexistuje.");
      return res.redirect(`/duels`);
    }

    // Fetch the user from the database
    const user = await User.findById(userId).populate({
      path: "userDuels",
      populate: {
        path: "duel",
      },
    });
    if (!user) {
      req.flash(
        "error",
        "Pro hlasování v duelu musíš být přihlášen/a pod existujícím účtem."
      );
      return res.redirect(`/users/login`);
    }

    // Fetch the hole from the database
    const hole = await Hole.findById(holeId).populate("course");
    if (!hole) {
      req.flash("error", "V duelu nelze hlasovat pro neexistující jamku.");
      return res.redirect(`/duels`);
    }

    // Check if the duel has already finished or has not even started yet
    const startDate = new Date(duel.startDate);
    const endDate = new Date(duel.endDate);
    const today = new Date();

    if (today.getTime() < startDate.getTime()) {
      // Send error message that the duel has not started yet and thus it is not possible to vote
      req.flash("error", "Duel ještě nezačal a proto zatím nelze hlasovat.");
      return res.redirect(`/duels/${duelId}`);
    }

    if (today.getTime() > endDate.getTime()) {
      // Send error message that the duel is finished thus it is not possible to vote
      req.flash("error", "Duel již skončil a nelze v něm hlasovat.");
      return res.redirect(`/duels/${duelId}`);
    }

    // Check if user has already voted in this duel
    let userDuel = user.userDuels.find(
      (userDuel) => userDuel.duel._id.toString() === duelId
    );

    if (!userDuel) {
      // Add one vote in the duel for the selected hole
      if (duel.holesInDuel[0].hole._id.toString() === holeId) {
        duel.holesInDuel[0].votes++;
        duel.holesInDuel[0].lastVoteTimeStamp = Date.now();
      } else if (duel.holesInDuel[1].hole._id.toString() === holeId) {
        duel.holesInDuel[1].votes++;
        duel.holesInDuel[1].lastVoteTimeStamp = Date.now();
      } else {
        // Send error message that the selected hole is not in the duel
        req.flash("error", "Zvolená jamka se v duelu nenachází!.");
        return res.redirect(`/duels/${duelId}`);
      }
    } else {
      // Send error message that the user has already voted in this duel
      req.flash(
        "error",
        `V tomto duelu si již hlasoval/a pro jamku č. ${hole.number} z hřiště ${hole.course.name}.`
      );
      return res.redirect(`/duels/${duelId}`);
    }

    // Create userduel
    userDuel = {
      duel: duel,
      hole: hole,
    };

    // Add userduel to users duels
    user.userDuels.push(userDuel);

    // Save the updated duel to the database
    await duel.save();

    // Save the updated user to the database
    await user.save();

    res.redirect(`/duels/${duelId}`);
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkuste prosím provést svou akci znovu."
    );
    return res.redirect("/duels");
  }
};
