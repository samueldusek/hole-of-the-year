const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/courses");
const passport = require("passport");

router.route("/").get(coursesController.showAllCourses);

router.route("/:id").get(coursesController.showCourse);

router.route("/:id/comments").post(
  // Check if user is signed in and can add comments!
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: "Pro možnost přidávat komentáře se musíš nejdříve přihlásit.",
  }),
  coursesController.addComment
);

module.exports = router;
