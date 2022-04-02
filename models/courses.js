/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 15:07:50
 * @LastEditTime: 2022-04-02 23:35:22
 * @Description: 课程相关路由文件
 */
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 7,
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
    type: [String],
    required: true,
  },
  saleNum: {
    type: Number,
    default: 0,
  },
  teacherID: {
    type: String,
  },
  date: {
    type: Date,
    require: true,
    default: Date.now,
  },
});

const Course = mongoose.model("Course", courseSchema);

function coursesValidate(reqBody) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(7).required(),
    description: Joi.string().required(),
    courseDetail: Joi.array().required(),
    tags: Joi.array().required(),
    comments: Joi.array(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

exports.coursesSchema = courseSchema;
exports.Course = Course;
exports.validate = coursesValidate;
