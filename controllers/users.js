const User = require("../models/user");
const { validationResult } = require("express-validator");

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
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash(
        "success",
        "Byli jste úspěšně zaregistrování. Můžete nominovat své oblíbené jamky!"
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
  console.log(req.user);
  res.redirect("/courses");
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Byli jste úspěšně odhlášeni.");
  res.redirect("/courses");
};
