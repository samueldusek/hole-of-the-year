const Hole = require("../models/hole");
const User = require("../models/user");

module.exports.nominateHole = async (req, res) => {
  // Deconstruct hole id from url
  const { holeId } = req.params;
  // Deconstruct user id and nomination option from body
  const { nomination, userId } = req.body;

  // Check for user id and nomination
  if (
    !userId ||
    !nomination ||
    !(nomination === "select" || nomination === "deselect")
  ) {
    let errorMsg = "";
    if (!userId)
      errorMsg = "Nelze nominovat jamku bez platného uživatelského id.";
    if (!nomination || !(nomination === "select" || nomination === "deselect"))
      errorMsg = "Zvolil jsi špatnou volbu pro nominaci jamky.";
    req.flash("error", errorMsg);
    return res.redirect("/courses");
  }

  try {
    // Find hole in the db and populate course
    const hole = await Hole.findById(holeId).populate("course");
    if (!hole) {
      req.flash("error", "Nelze nominovat neexistující jamku.");
      return res.redirect(`/courses`);
    }
    // Find user in db and populate its nominated holes
    const user = await User.findById(userId).populate("nominatedHoles");
    if (!user) {
      req.flash(
        "error",
        "Pro nominování musíš být přihlášen pod existujícím účtem."
      );
      return res.redirect(`/users/login`);
    }

    // Decide whether to nominate or denominate the hole
    if (nomination === "select") {
      // Check if user reached nomination limit (3)
      if (user.nominatedHoles.length < 3) {
        // Check whether the user has already nominated this hole
        const isNominated = user.nominatedHoles.find(
          (userHole) => hole._id.toString() === userHole._id.toString()
        );
        if (!isNominated) {
          // Increase the number of votes for the selected hole
          hole.votes++;
          // Save time stamp
          hole.lastVoteTimeStamp = Date.now();
          // Add new hole to users nominated hole
          user.nominatedHoles.push(hole);
          // Count votes left and tell user his nomination process was successful
          const votesLeft = 3 - user.nominatedHoles.length;
          req.flash(
            "success",
            `Úspěšně jsi nominoval/a jamku č. ${hole.number} na hřišti ${hole.course.name}. Ještě ti zbývá ${votesLeft} nominačních hlasů.`
          );
        } else {
          // User cannot nominate the same hole twice
          req.flash(
            "error",
            `Jamku č. ${hole.number} na hřišti ${hole.course.name} jsi již nominoval/a. Zkus prosím vybrat jinou.`
          );
        }
      } else {
        // User has already nominated three holes.
        req.flash(
          "error",
          `Již jsi nominoval/a 3 jamky. Abys mohl/a nominovat tuto jamku musíš zrušit svou nominaci u některé z již tebou nominovaných jamek.`
        );
      }
      // User wants to denominate the hole he/she nominated previously
    } else {
      // Check if the hole user wants to denominate is among his/her previously nominated holes
      const denominatedHole = user.nominatedHoles.filter(
        (userHole) => hole._id.toString() === userHole._id.toString()
      );
      if (denominatedHole.length > 0) {
        // The hole should always have positive number of votes
        if (hole.votes > 0) {
          hole.votes--;
        }
        // Delete denominated hole from users nominated holes array
        const newNominatedHoles = user.nominatedHoles.filter(
          (userHole) => hole._id.toString() !== userHole._id.toString()
        );
        user.nominatedHoles = newNominatedHoles;
        const votesLeft = 3 - user.nominatedHoles.length;
        req.flash(
          "success",
          `Úspěšně jsi denominoval/a jamku č. ${hole.number} na hřišti ${hole.course.name}. Ještě ti zbývá ${votesLeft} nominačních hlasů.`
        );
      } else {
        // User cannot denominate this hole as this hole is not among his previously nominated holes
        req.flash(
          "error",
          `Nemůžeš zrušit nominaci u této jamky, neboť si ji nenominoval/a.`
        );
      }
    }
    const updatedHole = await hole.save();
    await user.save();
    res.redirect(`/courses/${updatedHole.course._id}`);
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkuste prosím provést svou akci znovu."
    );
    return res.redirect("/courses");
  }
};

module.exports.getTopHoles = async (req, res) => {
  try {
    // Populate top 32 holes from the db
    const holes = await Hole.find({ votes: { $gt: 0 } })
      .populate("course")
      .sort({ votes: "desc", lastVoteTimeStamp: "asc" })
      .limit(32);
    res.render("holes/top", {
      holes: holes,
      pageTitle: "Top 32 Jamek - Jamka Roku 2021",
      path: "/holes/top",
    });
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkuste prosím provést svou akci znovu."
    );
    return res.redirect("/courses");
  }
};
