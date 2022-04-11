/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 13:36:02
 * @LastEditTime: 2022-04-11 16:54:05
 * @Description: 用户相关路由文件
 */
const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const multiparty = require("multiparty");
const fs = require("fs");
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { User, validate } = require("../models/users");
const { Course } = require("../models/courses");
const { Code } = require("../models/code");
const { createSixNum, nodemail } = require("../services/nodemailer");

//查询自己的信息
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

//根据id查找
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return false;
  const user = await User.findById(req.params.id).select(
    "_id name email avatar"
  );
  res.send(user);
});

//购买课程
router.post("/shopping", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.courseId);
  if (!course) return res.status(404).send("抱歉，你要购买的课程不存在");

  for (let i = 0; i < user.courses.length; i++) {
    if (user.courses[i] == req.body.courseId[0])
      return res.status(400).send("您已经购买过该课程，不能重复购买！");
  }
  user.set({
    courses: user.courses.concat(req.body.courseId),
  });
  const result = await user.save();
  res.send(result);
});

router.post("/searchByName", async (req, res) => {
  const user = await User.findOne({
    name: req.body.name,
  }).select("-password");
  if (!user) return res.status(404).send("抱歉，你要找的用户不存在");

  res.send(user);
});

let avatar = "";
router.patch("/", (req, res) => {
  let result = req.pipe(
    fs.createWriteStream("./public/uploads/avatars/image" + Date.now() + ".png")
  );
  avatar =
    "http://192.168.31.52:3000/" + result.path.split("./public/").join("");
  console.log(avatar);
  res.end("OK");
});

router.post("/android", function (req, res) {
  const form = new multiparty.Form();
  const date = Date.now();
  form.parse(req, function (err, fields, files) {
    //将前台传来的base64数据去掉前缀
    const avatar = fields.avatar[0].replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = new Buffer.from(avatar, "base64");
    //写⼊⽂件
    fs.writeFile(
      "./public/uploads/avatars/image" + date + ".png",
      dataBuffer,
      function (err) {
        if (err) {
          res.send(err);
        } else {
          res.send("保存成功");
        }
      }
    );
  });
  avatar = "http://192.168.31.52:3000/uploads/avatars/image" + date + ".png";
});

//发送验证码
router.post("/code", async (req, res) => {
  console.log(req.body);
  const code = createSixNum(); //生成的随机六位数
  let mail = {
    // 发件人
    from: "<qzlu3773@163.com>",
    // 主题
    subject: "接受凭证", //邮箱主题
    // 收件人
    to: req.body.email, //前台传过来的邮箱
    // 邮件内容，HTML格式
    text: "用" + code + "作为你的验证码", //发送验证码
  };
  nodemail(mail);

  let validationCode = new Code({
    code: code,
    email: req.body.email,
    timestamp: new Date().getTime(),
  });

  validationCode = await validationCode.save();

  res.send({
    code: 0,
    message: "发送成功",
  });
});

//注册
router.post("/", async (req, res) => {
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const userEmail = await User.findOne({
    email: req.body.email,
  });
  if (userEmail) return res.status(400).send("邮箱已被注册");

  const userName = await User.findOne({
    name: req.body.name,
  });
  if (userName) return res.status(400).send("用户名已被注册");

  const result = await Code.findOneAndDelete(req.body.email);

  if (result) {
    const registerTime = new Date().getTime();
    if (registerTime - result.timestamp >= 5 * 1000 * 60) {
      return res.send({
        code: -1,
        msg: "验证码已过期",
      });
    }

    if (req.body.code === result.code) {
      if (!userEmail && !userName) {
        let user = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        });
        avatar = "";
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        const token = user.generateAuthToken();
        user = await user.save();
        res
          .header("x-auth-token", token)
          .send(_.pick(user, ["_id", "name", "email", "avatar"]));
      } else {
        res.send({
          code: -1,
          msg: "发生错误",
        });
      }
    } else {
      return res.send({
        code: -1,
        msg: "验证码错误",
      });
    }
  } else {
    res.send({
      code: -1,
      msg: "发生错误",
    });
  }
});

//编辑个人信息
router.put("/editInfo", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const validPassword = await bcrypt.compare(
    req.body.prePassword,
    user.password
  );
  const salt = await bcrypt.genSalt(10);
  if (validPassword) {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        password: await bcrypt.hash(req.body.password, salt),
      },
      {
        new: true,
      }
    );
    res.send("修改成功");
  } else {
    return res.status(400).send("修改失败");
  }
});

module.exports = router;
