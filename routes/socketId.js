/*
 * @Author: 刘俊琪
 * @Date: 2022-04-13 19:09:31
 * @LastEditTime: 2022-04-13 19:21:10
 * @Description: 描述
 */
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { SocketId, validate } = require("../models/socketId");
const { route } = require("./users");

router.post("/", auth, async (req, res) => {
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let socketId = new SocketId({
    user: req.user._id,
    socketId: req.body.socketId,
  });

  socketId = await socketId.save();
  res.send(socketId);
});

router.put("/", auth, async (req, res) => {
  let socketId = await SocketId.find({
    user: req.user._id,
  });

  socketId.set({
    socketId: req.body.socketId,
  });

  socketId = await socketId.save();
  res.send(socketId);
});

module.exports = router;
