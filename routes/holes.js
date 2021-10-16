const express = require("express");
const router = express.Router();
const holesController = require("../controllers/holes");
const isAuth = require("../utils/isAuth");
const isVerified = require("../utils/isVerified");

router
  .route("/:holeId")
  .put(
    isAuth.ensureAuthenticated,
    isVerified.ensureVerified,
    holesController.nominateHole
  );

router.route("/top").get(holesController.getTopHoles);

module.exports = router;
