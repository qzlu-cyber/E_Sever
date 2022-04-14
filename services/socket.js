/*
 * @Author: 刘俊琪
 * @Date: 2022-04-13 15:48:36
 * @LastEditTime: 2022-04-14 14:04:50
 * @Description: 描述
 */
const { ChatMessage } = require("../models/chatMessages");
const { User } = require("../models/users");

let users = {};

module.exports = function socket(sever) {
  const io = require("socket.io")(sever);
  io.on("connection", (socket) => {
    console.log("客户端连接成功");
    console.log(socket.id);
    socket.on("login", (from) => {
      socket.name = from;
      users[from] = socket.id;
      console.log("users", users);
    });
    socket.on("sendMessage", ({ from, to, content }) => {
      const chat_id = [from, to].sort().join("_");
      let message = new ChatMessage({
        from,
        to,
        content,
        chat_id,
      });
      const saveMessage = async (message) => {
        await message.save();
      };
      saveMessage(message);
      socket.to(users[to]).emit("recieveMessage", content);
    });
    socket.on("disconnecting", () => {
      if (users.hasOwnProperty(socket.name)) {
        delete users[socket.name];
        console.log(socket.id + "离开");
      }
    });
  });
};
