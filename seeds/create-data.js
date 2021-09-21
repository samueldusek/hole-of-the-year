// Require .env file
require("dotenv").config({ path: "../.env" });

// Load installed packages
const mongoose = require("mongoose");
const fs = require("fs");

// Load models
const Course = require("../models/course");
const Hole = require("../models/hole");

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

const createData = async () => {
  const coursesData = [];
  const courses = await Course.find({}).populate("holes");
  for (let course of courses) {
    coursesData.push({
      name: course.name,
      slug: course.slug,
      type: course.type,
      region: course.region,
      folderId: course.folderId,
      url: "link",
      company: {
        name: "Company's name",
        url: "link",
      },
      image: {
        url: "link",
        author: {
          name: "Author's name",
          tag: "Author's tag",
          url: "link",
        },
      },
      holes: course.holes.map((hole) => ({
        number: hole.number,
        length: hole.length,
        par: hole.par,
        image: {
          url: "link",
        },
      })),
    });
  }
  fs.writeFile("courses.json", JSON.stringify(coursesData), (error) => {
    if (error) throw error;
    console.log("The courses were saved to courses.json");
  });
};

createData().then(() => {
  db.close();
});
