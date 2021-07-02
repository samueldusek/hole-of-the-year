module.exports.getCzechDatePlusTime = (date) => {
  return `${date.getDate()}. ${
    date.getMonth() + 1
  }. ${date.getFullYear()} v ${date.getHours()}:${date.getMinutes()}`;
};

module.exports.getCzechDate = (date) => {
  return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
};
