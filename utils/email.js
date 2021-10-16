const { getSubject, getHTMLPart } = require("../data/email");
const mailjet = require("node-mailjet").connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

module.exports.sendRegistrationEmail = (user) => {
  return new Promise((resolve, reject) => {
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL,
            Name: "Jamka Roku 2021",
          },
          To: [
            {
              Email: user.email,
              Name: user.username,
            },
          ],
          Subject: getSubject(),
          HTMLPart: getHTMLPart(user.username, user.token),
        },
      ],
    });
    request
      .then((result) => {
        resolve(result.body);
      })
      .catch((err) => {
        reject(err.statusCode);
      });
  });
};
