/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 15:07:50
 * @LastEditTime: 2022-04-06 11:28:32
 * @Description: 课程相关路由文件
 */
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 70,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  courseDetail: {
    type: Array,
    required: true,
  },
  comments: {
    type: Array,
  },
  tags: {
    type: String,
    required: true,
  },
  saleNum: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
    required: true,
  },
  //链接文档
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

const Course = mongoose.model("Course", courseSchema);

function coursesValidate(reqBody) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(70).required(),
    description: Joi.string().required(),
    courseDetail: Joi.array().required(),
    tags: Joi.string().required(),
    comments: Joi.array(),
    price: Joi.number().min(0).required(),
    teacher: Joi.string(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

exports.courseSchema = courseSchema;
exports.Course = Course;
exports.validate = coursesValidate;
