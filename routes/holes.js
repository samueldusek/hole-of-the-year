const express = require("express");
const router = express.Router();
const holesController = require("../controllers/holes");
const isAuth = require("../utils/isAuth");

router
  .route("/:holeId")
  .put(isAuth.ensureAuthenticated, holesController.nominateHole);

router.route("/top").get(holesController.getTopHoles);

module.exports = router;
