// Load installed packages
const mongoose = require("mongoose");
const slugify = require("slugify");
const fs = require("fs");

// Load data
const courses = require("./courses");
console.log(courses[0].CourseName);

// Load models
const Course = require("../models/course");
const Hole = require("../models/hole");
const Duel = require("../models/duel");

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

// Constants
const DUELS_START_DATE = new Date(2021, 5, 26, 0);

fs.unlinkSync("../images/courses.csv", (err) => {
  if (err) {
    console.log(err);
  }
});

const stream = fs.createWriteStream("../images/courses.csv", { flags: "a" });

const seedDB = async () => {
  let folderId = 1;
  await Course.deleteMany({});
  await Hole.deleteMany({});
  for (let i = 0; i < courses.length; i++) {
    if (i === 0 || courses[i].CourseName !== courses[i - 1].CourseName) {
      const course = new Course({
        name: courses[i].CourseName,
        slug: slugify(courses[i].CourseName, { lower: true }),
        type: courses[i].LayoutName,
        region: courses[i].CourseRegion,
        folderId: ("" + folderId).padStart(3, "0"),
      });
      await course.save();
      stream.write(`${course.folderId},${course.name},\n`);
      folderId++;
    }
    const hole = new Hole({
      number: courses[i].HoleNumber,
      length: courses[i].HoleLenght,
      par: courses[i].HolePar,
      votes: Math.floor(Math.random() * 500),
    });
    const course = await Course.findOne({ name: courses[i].CourseName });
    hole.course = course;
    course.holes.push(hole);
    await course.save();
    await hole.save();
  }
  await Duel.deleteMany({});
  let startDate = DUELS_START_DATE;
  const topHoles = await Hole.find({ votes: { $gt: 0 } })
    .populate("course")
    .sort({ votes: "descending" })
    .limit(16);
  for (let i = 0; i < 8; i++) {
    const duel = new Duel({
      startDate: startDate,
      endDate: new Date(startDate.getTime() + 86340000),
      round: i + 1,
    });
    duel.holesInDuel.push({
      hole: topHoles[2 * i],
      votes: Math.floor(Math.random() * 300),
    });
    duel.holesInDuel.push({
      hole: topHoles[2 * i + 1],
      votes: Math.floor(Math.random() * 300),
    });
    await duel.save();
    startDate = new Date(startDate.getTime() + 86400000);
  }
};

seedDB().then(() => {
  db.close();
});
