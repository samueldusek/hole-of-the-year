const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const isAuth = require("../utils/isAuth");

router
  .route("/")
  .post(isAuth.ensureAuthenticated, commentsController.addComment);

router
  .route("/:commentId")
  .put(isAuth.ensureAuthenticated, commentsController.likeComment);

router.route("/top").get(commentsController.getTopComments);

module.exports = router;
