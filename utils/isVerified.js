module.exports = {
  ensureVerified: (req, res, next) => {
    console.log(req.user);
    if (req.user.isVerified) {
      return next();
    }
    req.flash(
      "error",
      "Pro nominování jamek, psaní komentářů a hlasování v duelech je potřeba nejdříve ověřit váš účet kliknutím na link, který jsme vám při registraci zaslali na email."
    );
    return res.redirect("/courses");
  },
};
