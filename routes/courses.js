/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 15:16:26
 * @LastEditTime: 2022-04-09 11:30:39
 * @Description: 课程相关路由
 */
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const fs = require("fs");

const auth = require("../middlewares/auth");
const { Course, validate } = require("../models/courses");

//查询操作符
// eq(=) ne(!=) gt(>) gte(>=) lt(<) lte(<=) in nin

//获取所有课程，用于展示课程
router.get("/", async (req, res) => {
  const courses = await Course.find();

  res.send(courses);
});

//模糊查询特定类别课程，用于分类
router.post("/searchByTag", async (req, res) => {
  const reg = new RegExp(req.body.tag, "i");
  const courses = await Course.find({ name: { $regex: reg } });

  res.send(courses);
});

//根据购买人数查询热门课程
router.get("/searchByHot", async (req, res) => {
  const courses = await Course.find().sort({ saleNum: -1 }).limit(5);

  res.send(courses);
});

//根据课程发布时间查询课程
router.get("/searchByDate", async (req, res) => {
  const courses = await Course.find().limit(5).sort({ date: -1 });

  res.send(courses);
});

//根据老师查询课程
router.get("/searchByTeacher", async (req, res) => {
  const courses = await Course.find({ teacherID: req.body.teacherID }).sort({
    saleNum: 1,
  });

  res.send(courses);
});

//展示单个课程（用于显示某一课程详情）
router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).send("抱歉，你要找的课程不存在");

  const result = await Course.findById(req.params.id).populate(
    "teacher",
    "name -_id"
  ); // 附带老师信息将课程所有信息打印出来

  res.send(result);
});

// 上传视频
let courseDetail = [];
router.patch("/", (req, res) => {
  console.log(req.body);
  let result = req.pipe(
    fs.createWriteStream("./public/uploads/courses/video" + Date.now() + ".mp4")
  );
  courseDetail.push(
    "http://192.168.31.52:3000/" + result.path.split("./public/").join("")
  );
  console.log(courseDetail);
  res.end("OK");
});

//发布课程
router.post("/", async (req, res) => {
  // console.log(req.user);
  //如果有权限检查body体是否合法
  validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const courseName = await Course.findOne({
    name: req.body.name,
  });
  if (courseName) return res.status(400).send("与其他课程重名了，更换一个吧！");

  if (!courseName) {
    for (let i = 0; i < req.body.courseDetail.length; i++) {
      req.body.courseDetail[i].uri = courseDetail[i];
    }
    courseDetail = [];
    console.log("req.body.courseDetail", courseDetail);
    let course = new Course({
      name: req.body.name,
      description: req.body.description,
      courseDetail: req.body.courseDetail,
      tags: req.body.tags,
      price: req.body.price,
      teacher: req.body.teacher,
      teacherName: req.body.teacherName,
      cover: req.body.cover,
    });
    course = await course.save();
    console.log(course);
    res.send(course);
  } else {
    res.send({
      code: -1,
      msg: "发生错误",
    });
  }
});

//增加课程新章节
router.put("/editInfo/:id", auth, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).send("您要更改的课程不存在！");

  console.log(course.teacher == req.user._id);
  if (!(course.teacher == req.user._id)) {
    return res.status(400).send("无更改权限！！！");
  } else {
    console.log(req.body);
    course.set({
      courseDetail: course.courseDetail.concat(req.body.courseDetail),
    });
    const result = await course.save();
    res.send(result);
  }
});

module.exports = router;
