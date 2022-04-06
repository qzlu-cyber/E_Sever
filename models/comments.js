/*
 * @Author: 刘俊琪
 * @Date: 2022-04-06 15:01:18
 * @LastEditTime: 2022-04-06 16:08:32
 * @Description: 动态评论model
 */
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const commentSchema = new mongoose.Schema({
  //评论主体
  comment: {
    type: String,
    minlength: 3,
    maxlength: 200,
    required: true,
  },
  like: {
    type: Number,
    default: 0,
  },
  //楼中楼评论
  comments: {
    type: [this.commentSchema],
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
  //评论发给谁的
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    require: true,
  },
  //哪篇文章下的评论
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Articles",
    require: true,
  },
});

const Comment = mongoose.model("Comments", commentSchema);

function commentValidate(reqBody) {
  const schema = Joi.object({
    comment: Joi.string().min(3).max(200).required(),
    toUser: Joi.string().required(),
    article: Joi.string().required(),
    commentId: Joi.string(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

exports.commentSchema = commentSchema;
exports.Comment = Comment;
exports.validate = commentValidate;
