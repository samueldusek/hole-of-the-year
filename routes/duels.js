const express = require("express");
const router = express.Router();
const duelsController = require("../controllers/duels");
const protector = require("../utils/protectors");

router.route("/").get(duelsController.showAllDuels);

router
  .route("/:id")
  .get(duelsController.showDuel)
  .put(
    protector.ensureAuthenticated,
    protector.ensureVerified,
    duelsController.voteInDuel
  );

module.exports = router;
