/*
 * @Author: 刘俊琪
 * @Date: 2022-04-06 14:32:40
 * @LastEditTime: 2022-04-10 13:53:24
 * @Description: 动态 model
 */
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const { commentSchema } = require("./comments");

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 5,
    maxlength: 20,
    required: true,
  },
  body: {
    type: String,
    minlength: 6,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: [commentSchema],
    default: [],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    require: true,
  },
  postTime: {
    type: Date,
    default: Date.now,
  },
});

const Article = mongoose.model("Articles", articleSchema);

function articleValidate(reqBody) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(20).required(),
    body: Joi.string().min(6).required(),
    author: Joi.string().required(),
    likes: Joi.number(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

exports.articleSchema = articleSchema;
exports.Article = Article;
exports.validate = articleValidate;
