// Load installed packages
const mongoose = require("mongoose");
const slugify = require("slugify");

// Load data
const courses = require("./courses");
console.log(courses[0].CourseName);

// Load models
const Course = require("../models/course");
const Hole = require("../models/hole");

//Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/hole-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Course.deleteMany({});
  await Hole.deleteMany({});
  for (let i = 0; i < courses.length; i++) {
    if (i === 0 || courses[i].CourseName !== courses[i - 1].CourseName) {
      const course = new Course({
        name: courses[i].CourseName,
        slug: slugify(courses[i].CourseName, { lower: true }),
        type: courses[i].LayoutName,
        region: courses[i].CourseRegion,
      });
      await course.save();
    }
    const hole = new Hole({
      number: courses[i].HoleNumber,
      length: courses[i].HoleLenght,
      par: courses[i].HolePar,
    });
    const course = await Course.findOne({ name: courses[i].CourseName });
    hole.course = course;
    course.holes.push(hole);
    await course.save();
    await hole.save();
  }
};

seedDB().then(() => {
  db.close();
});
