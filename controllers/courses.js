const Course = require("../models/course");
const Hole = require("../models/hole");
const Comment = require("../models/comment");

const ITEMS_PER_PAGE = 8;

module.exports.showAllCourses = async (req, res) => {
  let page = req.query.page;
  if (!page) {
    page = 1;
  }

  const numberOfCourses = await Course.find().countDocuments();

  const courses = await Course.find({})
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .populate("holes");
  res.render("courses/index", {
    courses: courses,
    pageTitle: "Hřiště - Jamka Roku 2021",
    totalCourses: numberOfCourses,
    hasNextPage: ITEMS_PER_PAGE * page < numberOfCourses,
    hasPreviousPage: page > 1,
    nextPage: Number(page) + 1,
    previousPage: page - 1,
    currentPage: page,
    lastPage: Math.ceil(numberOfCourses / ITEMS_PER_PAGE),
  });
};

module.exports.showCourse = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id)
    .populate("holes")
    .populate("comments");
  res.render("courses/show", { course: course, pageTitle: course.name });
};

module.exports.addComment = async (req, res) => {
  const { id: courseId } = req.params;
  const { comment } = req.body;
  const newComment = new Comment({ text: comment });
  await newComment.save();
  const course = await Course.findById(courseId);
  course.comments.push(newComment);
  await course.save();
  req.flash("success", `Tvůj komentář byl přidán!`);
  res.redirect(`/courses/${course._id}`);
};
