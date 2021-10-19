const express = require("express");
const router = express.Router();
const duelsController = require("../controllers/duels");
const protector = require("../utils/protectors");

router
  .route("/")
  .get(protector.ensureVotingAllowed, duelsController.showAllDuels);

router
  .route("/:id")
  .get(protector.ensureVotingAllowed, duelsController.showDuel)
  .put(
    protector.ensureAuthenticated,
    protector.ensureVotingAllowed,
    protector.ensureVerified,
    duelsController.voteInDuel
  );

module.exports = router;
