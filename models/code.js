/*
 * @Author: 刘俊琪
 * @Date: 2022-04-10 15:48:24
 * @LastEditTime: 2022-04-10 15:56:54
 * @Description: 临时存放验证码
 */
const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema({
  code: {
    type: String,
  },
  email: {
    type: String,
  },
  timestamp: {
    type: String,
  },
});

const Code = mongoose.model("Codes", codeSchema);

exports.Code = Code;
