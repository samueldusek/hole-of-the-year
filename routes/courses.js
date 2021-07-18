const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/courses");
const passport = require("passport");
const isAuth = require("../utils/isAuth");

router.route("/").get(coursesController.showAllCourses);

router.route("/:id").get(coursesController.showCourse);

router.route("/:id/comments").post(isAuth.ensureAuthenticated, coursesController.addComment);

module.exports = router;
