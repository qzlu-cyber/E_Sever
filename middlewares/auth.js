/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 13:37:44
 * @LastEditTime: 2022-04-06 09:34:49
 * @Description: 验证用户Token
 */
const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("请提供Token!");

  try {
    const decoded = jwt.verify(token, config.get("jwtToken"));
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("非法Token!");
  }
}

module.exports = auth;
