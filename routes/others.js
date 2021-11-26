const express = require("express");
const router = express.Router();
const othersController = require("../controllers/others");

router.route(`/${process.env.FOO}`).get(othersController.showLuckers);

module.exports = router;
