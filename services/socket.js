/*
 * @Author: 刘俊琪
 * @Date: 2022-04-13 15:48:36
 * @LastEditTime: 2022-04-13 19:38:52
 * @Description: 描述
 */
const { SocketId, validate } = require("../models/socketId");

const { ChatMessage } = require("../models/chatMessages");

module.exports = function socket(sever) {
  const io = require("socket.io")(sever);
  io.on("connection", (socket) => {
    console.log("客户端连接成功");
    console.log(socket.id);
    socket.on("sendMessage", ({ from, to, content }) => {
      const deleteOldSocketId = async () => {
        await SocketId.findOneAndDelete({
          user: from,
        });
      };

      deleteOldSocketId();

      let socketId = new SocketId({
        user: from,
        socketId: socket.id,
      });

      const saveSocketId = async (socketId) => {
        await socketId.save();
      };

      saveSocketId(socketId);

      const getToUserSocketId = async () => {
        const result = await SocketId.find({
          user: to,
        });
        return result.socketId;
      };

      const toUserSocketId = getToUserSocketId();

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

      // io.sockets.connected[toUserSocketId].emit("message", message);
    });
  });
};
