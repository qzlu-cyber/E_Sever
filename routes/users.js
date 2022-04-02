/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 13:36:02
 * @LastEditTime: 2022-04-03 00:06:38
 * @Description: 用户相关路由文件
 */
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const multiparty = require("multiparty");
const fs = require("fs");
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { User, validate } = require("../models/users");

router.get("/:id", async (req, res) => {
  const user = await Users.findById(req.params.id);
  if (!user) return res.status(404).send("抱歉，你要找的用户不存在");

  res.send(user);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
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

router.post("/", async (req, res) => {
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const userEmail = await User.findOne({
    email: req.body.email,
  });
  const userName = await User.findOne({
    name: req.body.name,
  });
  if (userName) return res.status(400).send("用户名已被注册");
  if (userEmail) return res.status(400).send("邮箱已被注册");

  if (!userEmail && !userName) {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      avatar:
        avatar === "" ? "https://s1.ax1x.com/2020/08/01/a3Pbff.jpg" : avatar,
    });
    avatar = "";
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      config.get("jwtToken")
    );
    user = await user.save();
    res
      .header("x-auth-token", token)
      .send(_.pick(user, ["_id", "name", "email", "avatar"]));
  } else {
    res.send({
      code: -1,
      msg: "验证码错误",
    });
  }
});

router.put("/editInfo/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  const validPassword = await bcrypt.compare(
    req.body.prePassword,
    user.password
  );
  const salt = await bcrypt.genSalt(10);
  if (validPassword) {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        password: await bcrypt.hash(req.body.password, salt),
      },
      {
        new: true,
      }
    );
    res.send(user);
  } else {
    return res.status(400).send("修改失败");
  }
});

module.exports = router;
