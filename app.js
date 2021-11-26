// Require .env file
require("dotenv").config();
// Require nodejs-native packages
const path = require("path");
// Require express
const express = require("express");
// Require mongoose - handling db
const mongoose = require("mongoose");
// Require mongo connect package and set the MongoStore for storing sessions in db
const MongoStore = require("connect-mongo");
// Require session
const session = require("express-session");
// Require flash package to be able to flash messages to the user
const flash = require("connect-flash");
// Require the view engine - ejsMate
const ejsMate = require("ejs-mate");
// Set the method-override package so that the delete and put routes can be used
const methodOverride = require("method-override");
// Require passport for working with user accounts
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// Configure the app
const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
// Set in which folder should be the view engine looking for all the views, use path package to cunstruct the correct path based on the operating system
app.set("views", path.join(__dirname, "views"));
// Set url parsing
app.use(express.urlencoded({ extended: true }));
// Set postfix of method override
app.use(methodOverride("_method"));
// Set static serving of the public folder content
app.use(express.static(path.join(__dirname, "public")));
// Set sessions
app.use(
  session({
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      dbName: process.env.DB_NAME,
    }),
  })
);
// Set flash messages
app.use(flash());

// Set user authentication
const User = require("./models/user");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set local variables - will come with every response in res object
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.showDuelsLink = Date.now() / 1000 > process.env.DATE_PLAYOFF_START;
  res.locals.isBlackFriday =
    process.env.DATE_BLACK_FRIDAY_START < Date.now() / 1000 &&
    process.env.DATE_BLACK_FRIDAY_END > Date.now() / 1000;
  res.locals.isFreeShipping =
    process.env.DATE_FREE_SHIPPING_START < Date.now() / 1000 &&
    process.env.DATE_FREE_SHIPPING_END > Date.now() / 1000;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Connect to db
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Load all the routes
const courseRoutes = require("./routes/courses");
const userRoutes = require("./routes/users");
const holeRoutes = require("./routes/holes");
const duelRoutes = require("./routes/duels");
const commentRoutes = require("./routes/comments");
const otherRoutes = require("./routes/others");

// Set all the routes
app.use("/courses", courseRoutes);
app.use("/users", userRoutes);
app.use("/holes", holeRoutes);
app.use("/duels", duelRoutes);
app.use("/comments", commentRoutes);
app.use("/others", otherRoutes);

// Set the route for terms and conditions
app.get("/terms", (req, res) => {
  res.render("mains/terms", {
    pageTitle: "Podmínky soutěže - Jamka Roku 2021",
    path: "/mains/terms",
  });
});

// Set the route for the home page
app.get("/", (req, res) => {
  res.render("mains/home", {
    pageTitle: "Jamka Roku 2021",
    path: "/mains/home",
  });
});

// Set the route for the error page
app.get("*", (req, res) => {
  res.status(404).render("mains/404", {
    pageTitle: "Jamka Roku 2021 - Nenalezeno",
    path: "/mains/404",
  });
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`The app is listening on port ${port}`);
});
