// Require .env file
require("dotenv").config({ path: "../.env" });

// Load installed packages
const mongoose = require("mongoose");
const fs = require("fs/promises");

// Load models
const Course = require("../models/course");
const Hole = require("../models/hole");
const Duel = require("../models/duel");

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Load data
const loadData = async () => {
  const data = await fs.readFile("./courses.json");
  const courses = JSON.parse(data);
  return courses;
};

const seedDb = async () => {
  // Delete everything from the db
  await Course.deleteMany({});
  await Hole.deleteMany({});

  // Load data from the file
  const courses = await loadData();

  // Save data to database
  for (let course of courses) {
    const newCourse = new Course({
      name: course.name,
      slug: course.slug,
      type: course.type,
      region: course.region,
      folderId: course.folderId,
      url: course.url,
      company: course.company,
      image: course.image,
    });
    for (let hole of course.holes) {
      const newHole = new Hole({
        number: hole.number,
        length: hole.length,
        par: hole.par,
        image: hole.image,
      });
      newHole.course = newCourse;
      newCourse.holes.push(newHole);
      await newHole.save();
    }
    await newCourse.save();
  }
};

seedDb().then(() => {
  db.close();
});
