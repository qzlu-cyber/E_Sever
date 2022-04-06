/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 13:38:56
 * @LastEditTime: 2022-04-06 11:29:41
 * @Description: 用户属性字段
 */
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const { courseSchema } = require("./courses");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 7,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    maxlength: 1024,
    required: true,
  },
  avatar: {
    type: String,
    default: "https://s1.ax1x.com/2020/08/01/a3Pbff.jpg",
  },
  signature: {
    type: String,
    maxlength: 15,
    default: "这个人很神秘，什么也没留下",
  },
  // 用户类型，0: 学生，1: 老师，2: 管理员
  userView: {
    type: Number,
    default: 0,
  },
  //用户已购买的课程, 聚合文档
  courses: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Courses",
    default: [],
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      userView: this.userView,
    },
    config.get("jwtToken")
  );
  return token;
};

const User = mongoose.model("Users", userSchema);

function userValidate(reqBody) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(7).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(1).max(20).required(),
    avatar: Joi.string(),
    signature: Joi.string().max(15),
    userView: Joi.number(),
    courses: Joi.array(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

exports.userSchema = userSchema;
exports.User = User;
exports.validate = userValidate;
