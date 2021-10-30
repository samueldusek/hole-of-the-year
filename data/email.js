module.exports.getSubject = () => {
  return "Registrace - Jamka Roku 2021";
};

module.exports.getHTMLPart = (username, token) => {
  return `<h2>Ahoj ${username}, </h2><h1>Vítej v soutěži Discgolfová jamka roku 2021!</h1><p>Jak už jsme psali na webu, pro účast v anketě a další možnosti je třeba ověřit tvůj účet. Stačí kliknout na následující odkaz:</p><a href="https://www.jamkaroku.cz/users/verify/${token}" target="_blank"  rel="noreferrer" rel="noopener">https://www.jamkaroku.cz/users/verify/${token}</a><p>Přejeme příjemnou hru, šťastnou ruku, ať vyhraje ta nejlepší jamka a hlavně ať to lítá!</p><p>Tým <a href="https://www.prodiscgolf.cz/" target="_blank"  rel="noreferrer" rel="noopener">proDiscgolf.cz</a>, pořadatel Jamky roku 2021</p>`;
};
