/*
 * @Author: 刘俊琪
 * @Date: 2022-04-06 15:07:02
 * @LastEditTime: 2022-04-12 08:13:22
 * @Description: 评论 路由
 */
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { Article } = require("../models/articles");
const { Comment, validate } = require("../models/comments");
const { CicComment, cicCommentValidate } = require("../models/cicComments");
const { User } = require("../models/users");

//获取某一篇文章的comment
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return false;
  const comments = await Comment.find({
    article: req.params.id,
  });

  let users = [];
  for (let i = 0; i < comments.length; i++) {
    const user = await User.findById(comments[i].author).select("name avatar");
    users.push({ userInfo: user, comment: comments[i] });
  }
  res.send(users);
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

//发布楼中楼评论 cic -> comment in comment
router.post("/cic", auth, async (req, res) => {
  //如果有权限检查body体是否合法
  cicCommentValidate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //先找出主楼层的评论
  let comment = await Comment.findById(req.body.commentId);

  const from = await User.findById(req.user._id).select("name");
  const to = req.body.toUserId
    ? await User.findById(req.body.toUserId).select("name")
    : await User.findById(comment.author).select("name");
  //初始化楼中楼评论
  let commentInComment = new CicComment({
    comment: req.body.comment.replace(/<[^>]*>|/g, ""),
    author: from, //谁发的评论，从jwt中获取
    toUser: to, //给谁发的（根据前端传送的用户ID不同而不同，点击主楼层评论回复传送主楼层用户ID，传送楼中楼用户评论则传送楼中楼用户ID）
  });

  //   comment.comments = comment.comments.push(commentInComment);
  // commentInComment = await commentInComment.save();

  comment = await Comment.findByIdAndUpdate(req.body.commentId, {
    comments: comment.comments.concat([commentInComment]),
  });
  console.log(comment);

  res.send(commentInComment);
});

//删除comment
router.delete("/deleteComment", auth, async (req, res) => {
  if (req.user.userView < 2) return res.status(400).send("您没有权限");

  const comment = await Comment.findByIdAndDelete(req.body.commentId);

  res.send(comment);
});

//点赞评论
router.put("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return false;
  const beforeComment = await Comment.findById(req.params.id);
  const comment = await Comment.findByIdAndUpdate(
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
      likedComments:
        req.body.likes >= beforeComment.likes
          ? user.likedComments.concat([req.params.id])
          : user.likedComments.filter(function (item) {
              return item != req.params.id;
            }), //不知道为什么push方法不能用...
    },
    {
      new: true,
    }
  );
  res.send(comment);
});

module.exports = router;
