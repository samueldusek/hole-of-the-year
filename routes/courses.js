const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/courses");

router.route("/").get(coursesController.showAllCourses);

router.route("/:id").get(coursesController.showCourse);

module.exports = router;
