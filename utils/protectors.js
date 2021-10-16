const format = require("date-fns/format");

module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/users/login"); // if not auth
  },
  ensureVerified: (req, res, next) => {
    if (req.user.isVerified) {
      return next();
    }
    req.flash(
      "error",
      "Pro nominování jamek, psaní komentářů a hlasování v duelech je potřeba nejdříve ověřit váš účet kliknutím na link, který jsme vám při registraci zaslali na email."
    );
    return res.redirect("/courses");
  },
  ensureNominationAllowed: (req, res, next) => {
    const currentTime = new Date();
    const nominationStartTime = new Date(
      process.env.DATE_NOMINATION_START * 1000
    );
    const nominationEndTime = new Date(process.env.DATE_NOMINATION_END * 1000);
    if (currentTime < nominationStartTime) {
      const startTime = format(nominationStartTime, "d.M., HH:mm");
      req.flash(
        "error",
        `Ještě není možné jamky nominovat. Možnost nominovat až 3 z tvých nejoblíbenějších jamek bude spuštěna: ${startTime}.`
      );
      return res.redirect("/courses");
    }
    if (currentTime > nominationEndTime) {
      const endTime = format(nominationEndTime, "d.M., HH:mm");
      req.flash(
        "error",
        `Již není možné jamky nominovat. Možnost nominovat skončila: ${endTime}.`
      );
      return res.redirect("/courses");
    }
    next();
  },
};
