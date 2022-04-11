/*
 * @Author: 刘俊琪
 * @Date: 2022-04-06 15:07:02
 * @LastEditTime: 2022-04-11 12:28:24
 * @Description: 评论 路由
 */
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { Article } = require("../models/articles");
const { Comment, validate } = require("../models/comments");

//获取某一篇文章的comment
router.get("/:id", async (req, res) => {
  const comments = await Comment.find({
    article: req.params.id,
  });
  res.send(comments);
});

//发布comment
router.post("/", auth, async (req, res) => {
  //如果有权限检查body体是否合法
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let comment = new Comment({
    comment: req.body.comment.replace(/<[^>]*>|/g, ""), //评论体
    author: req.user._id, //发布评论的用户
    toUser: req.body.toUser, //给谁发的评论
    article: req.body.article, //在哪篇文章下的评论
  });

  comment = await comment.save();

  const article = await Article.findById(req.body.article);
  await Article.findByIdAndUpdate(
    req.body.article,
    {
      comments: article.comments.concat([comment._id]),
    },
    {
      new: true,
    }
  );
  res.send(comment);
});

//TODO:发布楼中楼评论 cic -> comment in comment
router.post("/cic", auth, async (req, res) => {
  //如果有权限检查body体是否合法
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //先找出主楼层的评论
  let comment = await Comment.findById(req.body.commentId);
  //初始化楼中楼评论
  let commentInComment = new Comment({
    comment: req.body.comment,
    author: req.user._id, //谁发的评论，从jwt中获取
    toUser: comment.author, //给谁发的（根据前端传送的用户ID不同而不同，点击主楼层评论回复传送主楼层用户ID，传送楼中楼用户评论则传送楼中楼用户ID）
  });

  //   comment.comments = comment.comments.push(commentInComment);
  //   comment = await comment.save();
  res.send(commentInComment);
});

//删除comment
router.delete("/deleteComment", auth, async (req, res) => {
  if (req.user.userView < 2) return res.status(400).send("您没有权限");

  const comment = await Comment.findByIdAndDelete(req.body.commentId);

  res.send(comment);
});

module.exports = router;
