/*
 * @Author: 刘俊琪
 * @Date: 2022-04-06 14:32:12
 * @LastEditTime: 2022-04-11 13:00:28
 * @Description: 动态页路由
 */
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { Article, validate } = require("../models/articles");
const { User } = require("../models/users");

// 获取文章
router.get("/", async (req, res) => {
  const articles = await Article.find().sort("title");
  res.send(articles);
});

//获取某一篇文章
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return false;
  const articles = await Article.findById(req.params.id);
  res.send(articles);
});

//获取某一篇文章的comment
router.get("/comments/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return false;
  const comments = await Article.findById(req.params.id).select("comments");
  res.send(comments);
});

//发布文章
router.post("/", auth, async (req, res) => {
  //如果有权限检查body体是否合法
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let article = new Article({
    title: req.body.title.replace(/<[^>]*>|/g, ""),
    body: req.body.body,
    author: req.user._id,
  });
  article = await article.save();
  res.send(article);
});

//删除文章(系统管理员才能删除)
router.delete("/:id", auth, async (req, res) => {
  if (req.user.userView < 2) return res.status(400).send("您没有权限");

  const article = await Article.findByIdAndDelete(req.params.id);

  res.send(article);
});

//点赞文章
router.put("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return false;
  const beforeArticle = await Article.findById(req.params.id);
  const article = await Article.findByIdAndUpdate(
    req.params.id,
    {
      likes: req.body.likes,
    },
    {
      new: true,
    }
  );
  const user = await User.findById(req.user._id);

  await User.findByIdAndUpdate(
    req.user._id,
    {
      likedArticles:
        req.body.likes >= beforeArticle.likes
          ? user.likedArticles.concat([req.params.id])
          : user.likedArticles.filter(function (item) {
              return item != req.params.id;
            }), //不知道为什么push方法不能用...
    },
    {
      new: true,
    }
  );
  res.send(article);
});

module.exports = router;
