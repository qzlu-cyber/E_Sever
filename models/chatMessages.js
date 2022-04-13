/*
 * @Author: 刘俊琪
 * @Date: 2022-04-13 15:42:56
 * @LastEditTime: 2022-04-13 17:20:29
 * @Description: 描述
 */
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const chatMessageSchame = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  chat_id: {
    type: String,
    required: true,
  },
  content: {
    type: Array,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createTime: {
    type: Number,
    default: Date.now(),
  },
});

const ChatMessage = mongoose.model("ChatMessages", chatMessageSchame);

function chatMessageValidate(reqBody) {
  const schema = Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
    content: Joi.array(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

exports.ChatMessage = ChatMessage;
exports.validate = chatMessageValidate;
