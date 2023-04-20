const getIndex = (req, res) => res.render('index');
const getNotFound = (req, res) => res.status(200).end();

module.exports = {
  getIndex,
  getNotFound,
};
