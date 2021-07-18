const express = require("express");
const router = express.Router();
const duelsController = require("../controllers/duels");
const isAuth = require("../utils/isAuth");

router.route("/").get(duelsController.showAllDuels);

router
  .route("/:id")
  .get(duelsController.showDuel)
  .put(isAuth.ensureAuthenticated, duelsController.voteInDuel);

module.exports = router;
