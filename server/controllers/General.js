const getIndex = (req, res) => res.render('index');
const getNotFound = (req, res) => res.status(404).end();

module.exports = {
  getIndex,
  getNotFound,
};
