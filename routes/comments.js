const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const isAuth = require("../utils/isAuth");
const isVerified = require("../utils/isVerified");

router
  .route("/")
  .post(
    isAuth.ensureAuthenticated,
    isVerified.ensureVerified,
    commentsController.addComment
  );

router
  .route("/:commentId")
  .put(
    isAuth.ensureAuthenticated,
    isVerified.ensureVerified,
    commentsController.likeComment
  );

router.route("/top").get(commentsController.getTopComments);

module.exports = router;
