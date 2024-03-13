//创建数据库
var MongoClient = require("mongodb").MongoClient;

// 环境配置
const env = require("./config");

// 数据库名称
const dbName = env.dbName;

var url = env.url + ":" + env.port + "/" + dbName;
// console.log(url);

// 创建连接
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  console.log("数据库连接成功!");

  // 创建集合
  // var dbase = db.db(dbName);
  //
  // dbase.createCollection("api", function (err, res) {
  //   if (err) throw err;
  //   console.log("创建集合!");
  //   db.close();
  // });

  // 数据库操作( CURD )
  // 插入一条数据
  // var dbo = db.db(dbName);

  // var obj = { time: Date.now(), url: "/" };
  // dbo.collection("api").insertOne(obj, function (err, res) {
  //   if (err) throw err;
  //   console.log("文档插入成功");
  //   db.close();
  // });


  // 插入多条数据
  // var dbo = db.db(dbName);
  // var myobj = [
  //   { time: Date.now(), url: "/1" },
  //   { time: Date.now(), url: "/2" },
  //   { time: Date.now(), url: "/3" },
  // ];
  // dbo.collection("api").insertMany(myobj, function (err, res) {
  //   if (err) throw err;
  //   console.log("插入的文档数量为: " + res.insertedCount);
  //   db.close();
  // });

  // 查询数据
  // var dbo = db.db(dbName);
  // dbo
  //   .collection("api")
  //   .find({})
  //   .toArray(function (err, result) {
  //     // 返回集合中所有数据
  //     if (err) throw err;
  //     console.log(result);
  //     db.close();
  //   });

  // 查询指定条件的数据
  // var dbo = db.db(dbName);
  // var whereStr = { url: "/b" }; // 查询条件
  // dbo
  //   .collection("api")
  //   .find(whereStr)
  //   .toArray(function (err, result) {
  //     if (err) throw err;
  //     console.log(result);
  //     db.close();
  //   });

  // 更新一条数据
  // var dbo = db.db(dbName);
  // var whereStr = { url: "/" }; // 查询条件
  // var updateStr = { $set: { url: "/modify" } };
  // dbo.collection("api").updateOne(whereStr, updateStr, function (err, res) {
  //   if (err) throw err;
  //   console.log("文档修改成功");
  //   db.close();
  // });

  // 更新多条数据 updateMany()
  // var dbo = db.db(dbName);
  // var whereStr = { type: "1" }; // 查询条件
  // var updateStr = { $set: { type: "01" } };
  // dbo.collection("api").updateMany(whereStr, updateStr, function (err, res) {
  //   if (err) throw err;
  //   console.log(res.result.nModified + " 条文档被更新");
  //   db.close();
  // });

  // 删除数据
  // var dbo = db.db(dbName);
  // var whereStr = { url: "/" }; // 查询条件
  // dbo.collection("api").deleteOne(whereStr, function (err, obj) {
  //   if (err) throw err;
  //   console.log("文档删除成功");
  //   db.close();
  // });

  // 删除多条数据 deleteMany()
  // var dbo = db.db(dbName);
  // var whereStr = { type: "0" }; // 查询条件
  // dbo.collection("api").deleteMany(whereStr, function (err, obj) {
  //   if (err) throw err;
  //   console.log(obj.result.n + " 条文档被删除");
  //   db.close();
  // });

  // 排序 使用 sort() 方法，该方法接受一个参数，规定是升序(1)还是降序(-1)
  // { type: 1 }  // 按 type 字段升序
  // { type: -1 } // 按 type 字段降序
  // var dbo = db.db(dbName);
  // var mysort = { url: 1 };
  // dbo
  //   .collection("api")
  //   .find()
  //   .sort(mysort)
  //   .toArray(function (err, result) {
  //     if (err) throw err;
  //     console.log(result);
  //     db.close();
  //   });

  // 查询分页  limit()
  // 如果要指定跳过的条数，可以使用 skip() 方法。
  // var dbo = db.db(dbName);
  // var mysort = { url: 1 };
  // dbo
  //   .collection("api")
  //   .find()
  //   .sort(mysort)
  //   .skip(2)
  //   .limit(2)
  //   .toArray(function (err, result) {
  //     if (err) throw err;
  //     console.log(result);
  //     db.close();
  //   });

  // 连接操作
  //

  // 删除集合
  // var dbo = db.db(dbName);
  // // 删除 test 集合
  // dbo.collection("test").drop(function (err, delOK) {
  //   // 执行成功 delOK 返回 true，否则返回 false
  //   if (err) throw err;
  //   if (delOK) console.log("集合已删除");
  //   db.close();
  // });
});
