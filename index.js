/*
 * @Author: 刘俊琪
 * @Date: 2022-04-02 13:28:28
 * @LastEditTime: 2022-04-15 13:19:27
 * @Description: 入口文件
 */
const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const app = express();
const http = require("http").createServer(app);
require("./services/socket")(http);

const users = require("./routes/users");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const articles = require("./routes/articles");
const comments = require("./routes/comments");
const chatMessages = require("./routes/chatMessages");

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

app.use(express.static(__dirname + "/public"));

if (!config.get("jwtToken")) {
  console.error("严重错误，未设置jwtToken!");
  process.exit(1);
}

mongoose.set("useCreateIndex", true);

mongoose
  .connect("mongodb://localhost/E_Online", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("数据库连接成功..."))
  .catch((error) => console.error(error));

app.use("/api/users", users);
app.use("/api/courses", courses);
app.use("/api/auth", auth);
app.use("/api/articles", articles);
app.use("/api/comments", comments);
app.use("/api/chatMessages", chatMessages);

const port = process.env.PORT || 3000;

http.listen(port, console.log(`正在监听${port}端口...`));
