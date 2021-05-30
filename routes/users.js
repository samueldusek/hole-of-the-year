const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

router
  .route("/register")
  .get(usersController.showRegisterForm)
  .post(
    body("email")
      .isEmail()
      .withMessage("Nezadal/a jsi email ve validním formátu jamka@roku.cz")
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              "Uživatel s tímto emailem už existuje, zvol si prosím jiný."
            );
          }
        });
      }),
    body("username")
      .isAlphanumeric()
      .withMessage(
        "Uživatelské jméno může obsahovat pouze písmena a čísla. Zvol si prosím jiné."
      )
      .custom((value) => {
        return User.findOne({ username: value }).then((user) => {
          if (user) {
            return Promise.reject(
              "Uživatel s tímto uživatelským jménem již existuje. Zvol si prosím jiné."
            );
          }
        });
      }),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Heslo musí mít minimálně 5 znaků. Zvol si prosím jiné."),
    body("passwordConfirmation").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Zadaná hesla nejsou stejná!");
      }
      return true;
    }),
    usersController.registerNewUser
  );

router
  .route("/login")
  .get(usersController.showLoginForm)
  .post(
    passport.authenticate("local", {
      failureFlash:
        "Zadaj jsi špatné uživatelské jméno nebo heslo. Zkus to prosím znovu.",
      failureRedirect: "/users/login",
    }),
    usersController.login
  );

router.get("/logout", usersController.logout);

module.exports = router;
