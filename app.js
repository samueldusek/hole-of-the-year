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
// Set posfix of method override
app.use(methodOverride("_method"));
// Set static serving of the public folder content
app.use(express.static(path.join(__dirname, "public")));
// Set sessions
app.use(
  session({
    name: "session",
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/hole-db",
      dbName: "hole-db",
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
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Connect to db
mongoose.connect("mongodb://localhost:27017/hole-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Load all the routes
const courseRoutes = require("./routes/courses");
const userRoutes = require("./routes/users");
const holeRoutes = require("./routes/holes");

// Set all the routes
app.use("/courses", courseRoutes);
app.use("/users", userRoutes);
app.use("/holes", holeRoutes);

// Set the route for terms and conditions
app.get("/terms", (req, res) => {
  res.render("mains/terms", {
    pageTitle: "Podmínky soutěže - Jamka Roku 2021",
  });
});

app.get("/", (req, res) => {
  res.redirect("/courses");
});

app.listen(3000, () => {
  console.log(`The app is listening on port 3000`);
});
