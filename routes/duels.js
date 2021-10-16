const express = require("express");
const router = express.Router();
const duelsController = require("../controllers/duels");
const isAuth = require("../utils/isAuth");
const isVerified = require("../utils/isVerified");

router.route("/").get(duelsController.showAllDuels);

router
  .route("/:id")
  .get(duelsController.showDuel)
  .put(
    isAuth.ensureAuthenticated,
    isVerified.ensureVerified,
    duelsController.voteInDuel
  );

module.exports = router;
