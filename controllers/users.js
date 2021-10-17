const User = require("../models/user");
const { validationResult } = require("express-validator");
const { sendRegistrationEmail } = require("../utils/email");
const { v4: uuidv4 } = require("uuid");
const format = require("date-fns/format");

module.exports.showRegisterForm = (req, res) => {
  res.render("users/register", {
    pageTitle: "Registrace - Jamka Roku 2021",
    errors: [],
    username: null,
    email: null,
    path: "/users/register",
  });
};

module.exports.registerNewUser = async (req, res) => {
  // Check if any validation errors exist, if so redirect user back to register page
  const { email, username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("users/register", {
      pageTitle: "Registrace - Jamka Roku 2021",
      errors: errors.array(),
      username: username,
      email: email,
      path: "/users/register",
    });
  }

  try {
    const user = new User({ email, username, token: uuidv4() });
    const registeredUser = await User.register(user, password);
    const emailResult = await sendRegistrationEmail(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash(
        "success",
        "Byli jste úspěšně zaregistrování. Navštivte prosím svůj email a klikněte na zaslaný odkaz pro ověření vašeho účtu."
      );
      return res.redirect("/courses");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/users/register");
  }
};

module.exports.showLoginForm = (req, res) => {
  res.render("users/login", {
    pageTitle: "Přihlášení - Jamka Roku 2021",
    path: "/users/login",
  });
};

module.exports.login = (req, res) => {
  req.flash("success", "Byli jste úspěšně přihlášeni.");
  res.redirect("/courses");
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Byli jste úspěšně odhlášeni.");
  res.redirect("/courses");
};

module.exports.verifyUser = async (req, res) => {
  const { token } = req.params;

  try {
    const userToVerify = await User.findOne({ token: token });
    if (!userToVerify) {
      req.logout();
      req.flash(
        "error",
        "Uživatel se zadaným verifikačním kódem neexistuje! Zaregistrujte se prosím znovu."
      );
      return res.redirect("/users/register");
    }
    userToVerify.isVerified = true;
    await userToVerify.save();
    req.flash(
      "success",
      "Tvůj účet byl úspěšně ověřen. Můžeš nominovat až 3 ze svých oblíbených jamek a následně hlasovat v duelech."
    );
    return res.redirect("/courses");
  } catch (error) {
    req.logout();
    req.flash(
      "error",
      "Uživatel se zadaným verifikačním kódem neexistuje! Zaregistrujte se prosím znovu."
    );
    return res.redirect("/users/register");
  }
};

module.exports.showUserProfile = async (req, res) => {
  const { _id: id } = req.user;

  try {
    const user = await User.findById(id)
      .populate({
        path: "nominatedHoles",
        populate: {
          path: "course",
          select: "name _id",
        },
      })
      .populate({
        path: "userDuels",
        populate: {
          path: "hole duel",
          populate: {
            path: "course",
            select: "name _id",
          },
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "course",
          select: "name _id",
        },
      });
    const formattedComments = user.comments.map((comment) => {
      return {
        ...comment._doc,
        date: format(comment.date, "d.M.y, HH:mm"),
      };
    });
    res.render("users/profile", {
      pageTitle: `Profil uživatele ${user.username}`,
      userHoles: user.nominatedHoles,
      userDuels: user.userDuels,
      userComments: formattedComments,
      path: "/users/profile",
    });
  } catch (error) {
    req.flash(
      "error",
      "Ooops! Omlouváme se, něco se pokazilo. Zkuste prosím provést svou akci znovu."
    );
    return res.redirect("/courses");
  }
};
