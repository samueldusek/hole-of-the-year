const fs = require("fs/promises");

// Load data
const loadData = async () => {
  const data = await fs.readFile("./courses_new.json");
  const courses = JSON.parse(data);
  return courses;
};

const formatData = async () => {
  // Load data from the file
  const courses = await loadData();
  const newCourses = [];
  for (let course of courses) {
    newCourses.push({
      name: course.name,
      slug: course.slug,
      type: course.type,
      region: course.region,
      folderId: course.folderId,
      url: course.image.url,
      company: {
        name: course.company.name,
        url: course.company.url,
      },
      image: {
        url: `https://res.cloudinary.com/dnlt6jw53/image/upload/courses/${course.folderId}/photo.jpg`,
        author: {
          name: course.image.author.name,
          tag: course.image.author.tag,
          url: course.image.author.url,
        },
      },
      holes: course.holes.map((hole) => ({
        number: hole.number,
        length: hole.length,
        par: hole.par,
        image: {
          url: `https://res.cloudinary.com/dnlt6jw53/image/upload/courses/${course.folderId}/holes/${hole.number}.jpg`,
        },
      })),
    });
  }
  fs.writeFile(
    "courses_formatted.json",
    JSON.stringify(newCourses),
    (error) => {
      if (error) throw error;
      console.log("The courses were saved to courses.json");
    }
  );
};

formatData().then(console.log("formatted"));
