const express = require("express");
const router = express.Router();
const holesController = require("../controllers/holes");
const protector = require("../utils/protectors");

router
  .route("/:holeId")
  .put(
    protector.ensureAuthenticated,
    protector.ensureNominationAllowed,
    protector.ensureVerified,
    holesController.nominateHole
  );

router.route("/top").get(holesController.getTopHoles);

module.exports = router;
