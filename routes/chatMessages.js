/*
 * @Author: 刘俊琪
 * @Date: 2022-04-13 15:44:05
 * @LastEditTime: 2022-04-13 16:25:50
 * @Description: 描述
 */
const express = require("express");
const router = express.Router();

const { ChatMessage } = require("../models/chatMessages");
const { User } = require("../models/users");
const auth = require("../middlewares/auth");

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("name");
  const messagesData = await ChatMessage.find({
    $or: [
      {
        from: req.user._id,
      },
      {
        to: req.user._id,
      },
    ],
  });
  res.send({
    code: 0,
    data: {
      user,
      messagesData,
    },
  });
});

router.post("/readMessage", auth, async (req, res) => {
  const from = req.body.to;
  const to = req.user._id;

  await ChatMessage.updateMany(
    {
      from,
      to,
      read: false,
    },
    {
      read: true,
    },
    {
      multi: true,
    },
    (err, doc) => {
      console.log("/readMessage", doc);
      res.send({
        code: 0,
        data: doc.nModified,
      });
    }
  );
});

router.delete("/deleteMessages:id", auth, async (req, res) => {
  const chatIdFrom = [req.user._id, req.params.id].sort().join("_");
  console.log(req.user._id, req.params.id);
  const messages = await ChatMessage.deleteMany(
    {
      //删除了双向数据，有待优化
      chat_id: chatIdFrom,
    },
    {
      multi: true,
    }
  );
  res.send(messages);
});

module.exports = router;
