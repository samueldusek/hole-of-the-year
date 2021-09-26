const Course = require("../models/course");
const slugify = require("slugify");
const format = require("date-fns/format");

const ITEMS_PER_PAGE = 8;

module.exports.showAllCourses = async (req, res) => {
  let courses = [];
  let numberOfCourses;
  let slug = "";

  try {
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
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkuste prosím provést svou akci znovu."
    );
    return res.redirect("/courses");
  }
};

module.exports.showCourse = async (req, res) => {
  const { id } = req.params;
  try {
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
        id: comment._id,
        author: comment.author,
        date: format(comment.date, "d.M.y, HH:mm"),
        text: comment.text,
        votes: comment.votes,
      };
    });

    res.render("courses/show", {
      course: course,
      comments: comments,
      pageTitle: course.name,
      path: "/courses/show",
    });
  } catch (error) {
    req.flash(
      "error",
      `Hřiště s id: ${id} neexistuje. Vyber, prosím, hřiště jiné.`
    );
    res.redirect("/courses");
  }
};
