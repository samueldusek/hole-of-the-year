const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const protector = require("../utils/protectors");

router
  .route("/")
  .post(
    protector.ensureAuthenticated,
    protector.ensureVerified,
    commentsController.addComment
  );

router
  .route("/:commentId")
  .put(
    protector.ensureAuthenticated,
    protector.ensureVerified,
    commentsController.likeComment
  );

router.route("/top").get(commentsController.getTopComments);

module.exports = router;
