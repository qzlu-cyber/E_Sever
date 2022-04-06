/*
 * @Author: 刘俊琪
 * @Date: 2022-04-05 15:03:15
 * @LastEditTime: 2022-04-06 08:09:48
 * @Description: 验证用户路由（用户登录）
 */
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();

const { User } = require("../models/users");

router.post("/", async (req, res) => {
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) return res.status(400).send("邮箱或密码错误");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("邮箱或密码错误");

  const token = user.generateAuthToken();
  res.send(token);
});

function validate(reqBody) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).max(20).required(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

module.exports = router;
