const Hole = require("../models/hole");
const User = require("../models/user");

module.exports.nominateHole = async (req, res) => {
  // Deconstructed hole id from url
  const { holeId } = req.params;
  // Deconstructed user id and nomination option from body
  const { nomination, userId } = req.body;
  // Find hole in db and populate course
  const hole = await Hole.findById(holeId).populate("course");
  // Find user in db and populate its nominated holes
  const user = await User.findById(userId).populate("nominatedHoles");
  // Decide wheter to nominate or denominate the hole
  if (nomination === "select") {
    // Check if user reached nomination limit (3)
    if (user.nominatedHoles.length <= 3) {
      // Check whether the user has already nominated this hole
      const isNominated = user.nominatedHoles.find(
        (userHole) => hole._id.toString() === userHole._id.toString()
      );
      if (!isNominated) {
        // Increase the number of votes for the selected hole
        hole.votes++;
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
  const updatedUser = await user.save();
  res.redirect(`/courses/${updatedHole.course._id}`);
};
