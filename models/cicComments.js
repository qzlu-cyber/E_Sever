/*
 * @Author: 刘俊琪
 * @Date: 2022-04-11 18:09:43
 * @LastEditTime: 2022-04-11 19:34:16
 * @Description: 楼中楼评论
 */
/*
 * @Author: 刘俊琪
 * @Date: 2022-04-06 15:01:18
 * @LastEditTime: 2022-04-06 16:08:32
 * @Description: 动态评论model
 */
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const cicCommentSchema = new mongoose.Schema({
  //评论主体
  comment: {
    type: String,
    minlength: 3,
    maxlength: 200,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  //楼中楼评论
  comments: {
    type: [this.cicCommentSchema],
    default: [],
  },
  author: {
    type: Object,
    require: true,
  },
  postTime: {
    type: Date,
    default: Date.now,
  },
  //评论发给谁的
  toUser: {
    type: Object,
    require: true,
  },
  //哪篇文章下的评论
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Articles",
    require: true,
  },
});

const CicComment = mongoose.model("CicComments", cicCommentSchema);

function cicCommentValidate(reqBody) {
  const schema = Joi.object({
    comment: Joi.string().min(3).max(200).required(),
    toUser: Joi.string(),
    article: Joi.string().required(),
    commentId: Joi.string(),
    toUserId: Joi.string(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

exports.cicCommentSchema = cicCommentSchema;
exports.CicComment = CicComment;
exports.cicCommentValidate = cicCommentValidate;
