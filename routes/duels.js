const express = require("express");
const router = express.Router();
const duelsController = require("../controllers/duels");

router.route("/").get(duelsController.showAllDuels);

router.route("/:id").get(duelsController.showDuel);

module.exports = router;
