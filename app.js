var express = require("express");
var app = express();
var router = require("./router/router.js");
var path = require('path');

var session = require('express-session');
global.PROJECTPATH = __dirname;
//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: {maxAge: 14*24*60*60*1000}
    //cookie默认设置为写入一个user字段，并且设置超时时间为14天。使用内存来保存session，比较方便毕竟存储的数据较少。
}));

//模板引擎
app.set("view engine","ejs");
//静态页面
app.use(express.static("./public"));
app.use("/pictures",express.static("./pictures"));
app.use(express.static(path.join(__dirname,'uploads')));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    next();
});
//路由表
app.post("/postTreeModel",router.doPostTree);      //上传树木模型到服务器
app.get("/getTreeModel",router.doGetTree);      //上传树木模型到服务器


app.listen(9091);
