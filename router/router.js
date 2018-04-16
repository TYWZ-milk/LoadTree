/**
 * Created by Danny on 2015/9/26 15:39.
 */
var formidable = require("formidable");
var db = require("../models/db.js");
var md5 = require("../models/md5.js");
var path = require("path");
var fs = require("fs");
var gm = require("gm");
var http = require("http");
var util = require("util");


//注册业务
exports.doPostTree = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        var TreeData = fields.treeData;
        var TreeID = fields.treeID;
        db.insertOne("trees", {
            "TreeID": TreeID,
            "treedata": TreeData
        }, function (err, result) {
            if (err) {
                res.send("-3"); //服务器错误
                return;
            }
            res.send("1");
        });
    });
};

exports.doGetTree = function (req, res, next) {
    var Collection = "trees";
    db.find(Collection,{},{},function(err,result){
        if(err){
            console.log(err);
        }
        res.send(result);
        console.log(result.length);
    });
    // console.log("查找成功");
};
