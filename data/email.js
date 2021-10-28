module.exports.getSubject = () => {
  return "Registrace - Jamka Roku 2021";
};

module.exports.getHTMLPart = (username, token) => {
  return `<h1>Ahoj ${username}, </h1><h3>Vítej v soutěži Jamka Roku 2021!</h3><p>Pro ověření tvého emailu prosím klikni na následující odkaz: <a href="https://www.jamkaroku.cz/users/verify/${token}" target="_blank"  rel="noreferrer" rel="noopener">https://www.jamkaroku.cz/users/verify/${token}</a></p>`;
};
