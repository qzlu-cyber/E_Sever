/*
 * @Author: 刘俊琪
 * @Date: 2022-04-13 19:05:33
 * @LastEditTime: 2022-04-13 19:09:20
 * @Description: 存放所有客户端的socketid，用于实时转发消息
 */
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const socketIdSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  socketId: {
    type: String,
    required: true,
  },
});

const SocketId = mongoose.model("SocketId", socketIdSchema);

function socketIdValidate(reqBody) {
  const schema = Joi.object({
    user: Joi.string().required(),
    socketId: Joi.string().required(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

exports.SocketId = SocketId;
exports.validate = socketIdValidate;
