/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 15:07:50
 * @LastEditTime: 2022-04-08 19:10:27
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
  cover: {
    type: String,
    // require: true,
  },
  courseDetail: {
    type: Array,
    // required: true,
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
  teacherName: {
    type: String,
    required: true,
  },
  //评分
  stars: {
    type: Number,
    default: 5,
  },
});

const Course = mongoose.model("Course", courseSchema);

function coursesValidate(reqBody) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(70).required(),
    description: Joi.string().required(),
    courseDetail: Joi.array(),
    tags: Joi.string().required(),
    comments: Joi.array(),
    price: Joi.number().min(0).required(),
    teacher: Joi.string().required(),
    cover: Joi.string(),
    teacherName: Joi.string().required(),
    starts: Joi.number(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

exports.courseSchema = courseSchema;
exports.Course = Course;
exports.validate = coursesValidate;
