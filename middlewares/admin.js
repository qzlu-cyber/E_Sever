module.exports = function (req, res, next) {
  if (!req.user.isAdmin) return res.status(403).send('非管理员禁止访问!');

  next();
};
