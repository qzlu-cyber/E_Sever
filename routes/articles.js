/*
 * @Author: 刘俊琪
 * @Date: 2022-04-06 14:32:12
 * @LastEditTime: 2022-04-11 07:16:26
 * @Description: 动态页路由
 */
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { Article, validate } = require("../models/articles");

// 获取文章
router.get("/", async (req, res) => {
  const articles = await Article.find().sort("title");
  res.send(articles);
});

//获取某一篇文章
router.get("/:id", async (req, res) => {
  const articles = await Article.findById(req.params.id);
  res.send(articles);
});

//发布文章
router.post("/", auth, async (req, res) => {
  //如果有权限检查body体是否合法
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let article = new Article({
    title: req.body.title,
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
  const article = await Article.findByIdAndUpdate(
    req.params.id,
    {
      likes: req.body.likes,
    },
    {
      new: true,
    }
  );
  res.send(article);
});

module.exports = router;
