/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 15:16:26
 * @LastEditTime: 2022-04-02 23:49:06
 * @Description: 课程相关路由
 */
const _ = require("lodash");
const express = require("express");
const router = express.Router();

const { Course, validate } = require("../models/courses");

//展示单个课程（用于显示某一课程详情）
router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).send("抱歉，你要找的用户不存在");

  res.send(course);
});

//查询操作符
// eq(=) ne(!=) gt(>) gte(>=) lt(<) lte(<=) in nin

//获取所有课程，用于展示课程
router.get("/", async (req, res) => {
  const courses = await Course.find();

  res.send(courses);
});

//查询特定类别课程，用于分类
router.get("/searchByTag", async (req, res) => {
  const courses = await Course.find({ tags: { $in: req.body.tag } });

  res.send(courses);
});

//根据购买人数查询热门课程
router.get("/searchByHot", async (req, res) => {
  const courses = await Course.find().limit(10).sort({ saleNUm: -1 });

  res.send(courses);
});

//根据课程发布时间查询课程
router.get("/searchByDate", async (req, res) => {
  const courses = await Course.find().limit(10).sort({ date: 1 });

  res.send(courses);
});

//根据老师查询课程
router.get("/searchByTeacher", async (req, res) => {
  const courses = await Course.find({ teacherID: req.body.teacherID }).sort({
    saleNum: 1,
  });

  res.send(courses);
});

//发布课程
router.post("/", async (req, res) => {
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const courseName = await Users.findOne({
    name: req.body.name,
  });
  if (courseName) return res.status(400).send("与其他课程重名了，更换一个吧！");

  if (!courseName) {
    let course = new Course({
      name: req.body.name,
      description: req.body.description,
      courseDetail: req.body.courseDetail,
      tags: req.body.tags,
    });

    course = await course.save();
    res.send(_.pick(user, ["_id", "name"]));
  } else {
    res.send({
      code: -1,
      msg: "发生错误",
    });
  }
});

//增加课程新章节
router.put("/editInfo/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!(course.teacherID === req.teacherID))
    return res.status(400).send("无更改权限！！！");
  else {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        courseDetail: courseDetail.push(req.body.courseDetail),
      },
      { new: true }
    );
    res.send(course);
  }
});

module.exports = router;
