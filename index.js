/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 13:28:28
 * @LastEditTime: 2022-04-03 18:37:36
 * @Description: 入口文件
 */
const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const app = express();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");

const users = require("./routes/users");
const courses = require("./routes/courses");

app.use(
  express.urlencoded({
    extended: true,
  })
);

if (!config.get("jwtToken")) {
  console.error("严重错误，未设置jwtToken!");
  process.exit(1);
}

app.use(
  express.json({
    limit: "5mb",
  })
);

app.use(express.static(__dirname + "/public"));

mongoose
  .connect("mongodb://localhost/E_Online", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("数据库连接成功..."))
  .catch((error) => console.error(error));

app.use("/api/users", users);
app.use("/api/courses", courses);

const port = process.env.PORT || 3000;

http.listen(port, console.log(`正在监听${port}端口...`));
