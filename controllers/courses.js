const Course = require("../models/course");
const Hole = require("../models/hole");
const Comment = require("../models/comment");
const slugify = require("slugify");

const ITEMS_PER_PAGE = 8;

module.exports.showAllCourses = async (req, res) => {
  // Check if there is a seach query
  if (req.query.q) {
    const slug = slugify(req.query.q, { lower: true });
    const searchQuery = `/${slug}/i`;
    const foundCourses = await Course.find({ slug: { $regex: slug } }).populate(
      "holes"
    );
    // Check if any course was found and if not tell the user to change his query
    if (foundCourses.length === 0) {
      req.flash(
        "error",
        `Pro výraz "${req.query.q}" nebylo nalezeno žádné hřiště. Zkus to prosím znovu.`
      );
      return res.redirect(`/courses/`);
    }
  }

  // Fetch all the courses names from db - wil be used latter as a hint in search bar
  const allCoursesNames = await Course.find({}, { name: 1, _id: 0 });
  const numberOfCourses = allCoursesNames.length;

  // Calculate the last page and check whether the query.page exceeds calculated value
  const lastPage = Math.ceil(numberOfCourses / ITEMS_PER_PAGE);

  // Check if the request is comming from page different from 1
  let page = req.query.page;
  if (!page || !parseInt(page) || page < 1) {
    page = 1;
  } else if (page > lastPage) {
    page = lastPage;
  } else {
    page = Math.floor(page);
  }

  const courses = await Course.find({})
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .populate("holes");
  res.render("courses/index", {
    allCoursesNames: allCoursesNames,
    courses: courses,
    pageTitle: "Hřiště - Jamka Roku 2021",
    totalCourses: numberOfCourses,
    hasNextPage: ITEMS_PER_PAGE * page < numberOfCourses,
    hasPreviousPage: page > 1,
    nextPage: Number(page) + 1,
    previousPage: page - 1,
    currentPage: page,
    lastPage: lastPage,
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
