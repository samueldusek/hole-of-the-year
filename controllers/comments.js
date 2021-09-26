const User = require("../models/user");
const Comment = require("../models/comment");
const Course = require("../models/course");
const format = require("date-fns/format");

module.exports.addComment = async (req, res) => {
  // Get the comment text, user and course ids
  const { comment, userId, courseId } = req.body;

  // Check for user id and course id
  if (!userId || !courseId || !comment) {
    let errorMsg = "";
    if (!userId) errorMsg = "Nelze přidat komentář bez uživatelského id.";
    if (!courseId) errorMsg = "Nelze přidat komentář bez id hřiště.";
    if (!comment) errorMsg = "Nelze přidat prázdný komentář.";
    req.flash("error", errorMsg);
    return res.redirect("/courses");
  }

  try {
    // Fetch the user from the database
    const user = await User.findById(userId);
    if (!user) {
      req.flash(
        "error",
        "Pro přidání komentáře musíš být přihlášen pod existujícím účtem."
      );
      return res.redirect(`/users/login`);
    }

    // Fetch the course from the database and add comment to it
    const course = await Course.findById(courseId);
    if (!course) {
      req.flash("error", "Přidat komentář lze pouze k existujícímu hřišti.");
      return res.redirect(`/courses`);
    }

    // Create new comment with given text and attach user to it
    const newComment = new Comment({
      text: comment,
      date: new Date(),
      author: user,
      course: course,
    });

    // Save the comment to the database
    await newComment.save();

    // Add comment to course
    course.comments.push(newComment);

    // Save the course to the database
    await course.save();

    // Send message to the user that the comment was added successfully
    req.flash("success", `Tvůj komentář byl přidán.`);
    res.redirect(`/courses/${courseId}`);
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkuste prosím provést svou akci znovu."
    );
    return res.redirect("/courses");
  }
};

module.exports.likeComment = async (req, res) => {
  // Deconstruct comment id from the url
  const { commentId } = req.params;
  // Deconstruct user and course ids from the body
  const { userId, courseId } = req.body;

  // Check for user id and course id
  if (!userId || !courseId) {
    req.flash(
      "error",
      "Nelze dat like komentáři bez id uživatele a id hřiště."
    );
    return res.redirect("/courses");
  }

  try {
    // Find course in the db and check whether the course exist
    const course = await Course.findById(courseId);
    if (!course) {
      req.flash(
        "error",
        "Nelze dat like komentáři na hřišti, které neexistuje."
      );
      return res.redirect("/courses");
    }

    // Find comment in the db and check whether the comment exist
    const comment = await Comment.findById(commentId);
    if (!comment) {
      req.flash(
        "error",
        "Nelze dat like komentáři který neexistuje. Vyber si prosim jiný komentář."
      );
      return res.redirect(`/courses/${courseId}`);
    }

    // Find user in the db and check whether the user exist
    const user = await User.findById(userId);
    if (!user) {
      req.flash(
        "error",
        "Pro přidání like komentáři musíš být přihlášen pod existujícím účtem."
      );
      return res.redirect(`/users/login`);
    }

    // Check whether user has liked the comment already
    if (user.likedComments.length > 0) {
      const isLikedByUser = user.likedComments.find(
        (comment) => comment._id.toString() === commentId
      );
      if (isLikedByUser) {
        req.flash(
          "error",
          "Tomuto komentáři si Like už dal. Nemůžeš dát víc jak dva Liky jednomu komentáři."
        );
        return res.redirect(`/courses/${courseId}`);
      }
    }

    // Give comment a like and save it to the db
    comment.votes++;
    comment.lastVoteTimeStamp = Date.now();
    await comment.save();

    // Save liked comment to the user's liked comments array and save it to the db
    user.likedComments.push(comment);
    await user.save();

    // Redirect user back to course page
    req.flash("success", "Děkujeme za like ke komentáři!");
    res.redirect(`/courses/${courseId}`);
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkuste prosím provést svou akci znovu."
    );
    return res.redirect("/courses");
  }
};

module.exports.getTopComments = async (req, res) => {
  try {
    // Find top 10 comments in the db and sort them from the best to the worst
    const comments = await Comment.find({ votes: { $gt: 0 } })
      .populate("author", "username")
      .populate("course", "name")
      .sort({ votes: "desc", lastVoteTimeStamp: "asc" })
      .limit(10);
    const firstColComments = [];
    const secondColComments = [];
    if (comments) {
      comments.forEach((comment, idx) => {
        const formattedComment = {
          ...comment._doc,
          date: format(comment.date, "d.M.y, HH:mm"),
        };
        idx < 5
          ? firstColComments.push(formattedComment)
          : secondColComments.push(formattedComment);
      });
    }
    res.render("comments/top", {
      firstColComments,
      secondColComments,
      pageTitle: "Top 10 komentářů - Jamka Roku 2021",
      path: "/comments/top",
    });
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkuste prosím provést svou akci znovu."
    );
    return res.redirect("/courses");
  }
};
