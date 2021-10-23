const express = require("express");
const router = express.Router();
const duelsController = require("../controllers/duels");
const protector = require("../utils/protectors");

router
  .route("/")
  .get(protector.ensureDuelsVisible, duelsController.showAllDuels);

router
  .route("/:id")
  .get(protector.ensureDuelsVisible, duelsController.showDuel)
  .put(
    protector.ensureAuthenticated,
    protector.ensureVotingAllowed,
    protector.ensureVerified,
    duelsController.voteInDuel
  );

module.exports = router;
