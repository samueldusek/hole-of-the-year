const Course = require("../models/course");
const Hole = require("../models/hole");
const Comment = require("../models/comment");
const User = require("../models/user");
const slugify = require("slugify");
const { getCzechDate, getCzechDatePlusTime } = require("../utils/helpers");

const ITEMS_PER_PAGE = 8;

module.exports.showAllCourses = async (req, res) => {
  let courses = [];
  let numberOfCourses;
  let slug = "";

  // Fetch all the courses names from db - wil be used latter as a hint in search bar
  const allCoursesNames = await Course.find({}, { name: 1, _id: 0 });

  // Find out the total number of courses to display across all pages
  if (req.query.q) {
    slug = slugify(req.query.q, { lower: true });
    numberOfCourses = await Course.find({
      slug: { $regex: slug },
    }).countDocuments();
    // Check if any course was found and if not tell the user to change his query
    if (!numberOfCourses) {
      req.flash(
        "error",
        `Pro výraz "${req.query.q}" nebylo nalezeno žádné hřiště. Zkus to prosím znovu.`
      );
      return res.redirect(`/courses/`);
    }
  } else {
    numberOfCourses = allCoursesNames.length;
  }

  // Calculate the last page and check whether the query.page exceeds calculated value
  const lastPage = Math.ceil(numberOfCourses / ITEMS_PER_PAGE);

  // Check if the request is coming from page different from 1st
  let page = req.query.page;
  if (!page || !parseInt(page) || page < 1) {
    page = 1;
  } else if (page > lastPage) {
    page = lastPage;
  } else {
    page = Math.floor(page);
  }

  // Check if there is a search query and find all courses to display for related page
  if (req.query.q) {
    courses = await Course.find({ slug: { $regex: slug } })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("holes");
  } else {
    // Fetch all the courses for related page if there is no search query
    courses = await Course.find({})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("holes");
    numberOfCourses = allCoursesNames.length;
  }

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
    searchQuery: slug.length > 0 ? `&q=${slug}` : slug,
    path: "/courses/index",
  });
};

module.exports.showCourse = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id)
    .populate("holes")
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
    });

  // Convert all the dates in comments to human readable czech format
  const comments = course.comments.map((comment) => {
    return {
      author: comment.author,
      date: getCzechDatePlusTime(comment.date),
      text: comment.text,
    };
  });

  res.render("courses/show", {
    course: course,
    comments: comments,
    pageTitle: course.name,
    path: "/courses/show",
  });
};

module.exports.addComment = async (req, res) => {
  // Get the course id
  const { id: courseId } = req.params;
  // Get the comment text and user id
  const { comment, userId } = req.body;

  // Fetch the user from the database
  const user = await User.findById(userId);

  // Create new comment with given text and attach user to it
  const newComment = new Comment({
    text: comment,
    date: new Date(),
    author: user,
  });

  // Save the comment to the database
  await newComment.save();

  // Fetch the course from the database and add comment to it
  const course = await Course.findById(courseId);
  course.comments.push(newComment);

  // Save the course to the database
  await course.save();

  // Send message to the user that the comment was added successfully
  req.flash("success", `Tvůj komentář byl přidán!`);
  res.redirect(`/courses/${course._id}`);
};
