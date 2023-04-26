const getIndex = (req, res) => res.status(200).render('index');
const getNotFound = (req, res) => res.status(404).render('notFound');

module.exports = {
  getIndex,
  getNotFound,
};
