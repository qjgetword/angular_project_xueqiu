const MongoClient = require("mongodb").MongoClient;
// 引用ObjectId类型
const ObjectId = require("mongodb").ObjectId;
// 环境配置
const env = require("./config");

// 数据库名称
const dbName = env.dbName;

// 集合名称
const documentName = "api";

const url = env.url + ":" + env.port + "/" + dbName;

const CURD_DB = {
  creatDB: async function (options) {
    let conn = null;
    const document_name = options.documentName || documentName;
    const time = Date.now();
    const data =
      {
        ...options.params,
        time: time,
        status: 1,
      } || {};
    try {
      conn = await MongoClient.connect(url);
      const test = conn.db(dbName).collection(document_name);
      // 增加
      await test.insertOne(data);
    } catch (error) {
      console.log("错误：" + error);
    } finally {
      if (conn != null) conn.close();
    }
  },
  updateDB: async function (options) {
    let conn = null;
    const document_name = options.documentName || documentName;
    const time = Date.now();
    const data =
      {
        ...options.params,
        time: time,
      } || {};
    const filter =
      {
        ip:options.params.ip,
        status: 1,
      } || {};

    try {
      conn = await MongoClient.connect(url);
      const test = conn.db(dbName).collection(document_name);
      // 增加
      // console.log(data);
      await test.updateOne(filter,{$set:data});
    } catch (error) {
      console.log("错误：" + error);
    } finally {
      if (conn != null) conn.close();
    }
  },
  findDB: async function (params) {
    const skip = parseInt(params.skip);
    const limit = parseInt(params.limit);
    const sort = params.sort || { time: -1 };
    const document_name = params.documentName || documentName;
    let conn = null;
    try {
      conn = await MongoClient.connect(url);
      const test = conn.db(dbName).collection(document_name);
      
      const paramsFind = JSON.parse(params.params.params);
      paramsFind.ip = params.params.ip;
      // console.log(paramsFind);
      var arr = await test
        .find(paramsFind)
        .sort(sort)
        // .skip(skip)
        .limit(limit)
        .toArray();
      return arr;
    } catch (error) {
      console.log("错误：" + error);
    } finally {
      if (conn != null) conn.close();
    }
  },
  deleteDB: async function (params) {
    let conn = null;
    const document_name = params.documentName || documentName;

    try {
      conn = await MongoClient.connect(url);
      const test = conn.db(dbName).collection(document_name);
      const data =
      {
        ...params.params
      }
      console.log(data);
      // 更新
      let ldata = { 
        params: {

          
          documentName: 'watchlist',
        },

      };
      const arr = await test.deleteMany(ldata);

      return arr;
    } catch (error) {
      // console.log("错误：" + error);
    } finally {
      // console.log("结束");
      if (conn != null) conn.close();
    }
  },
  del: async function (params) {
    let conn = null;
    const document_name = params.documentName || documentName;

    try {
      conn = await MongoClient.connect(url);
      mongo = require('mongodb')
      const test = conn.db(dbName).collection(document_name);

      const arr = await test.deleteOne({ _id: new mongo.ObjectId(params.params._id) });

      return arr;
    } catch (error) {
      console.log("错误：" + error);
    } finally {
      console.log("结束");
      if (conn != null) conn.close();
    }
  },

  delMany: async function (params) {
    let conn = null;
    const document_name = params.documentName || documentName;

    try {
      conn = await MongoClient.connect(url);
      mongo = require('mongodb')
      const test = conn.db(dbName).collection(document_name);

      let deleteMany_ids = []; 

      Object.keys(params.params).forEach(v => {
        deleteMany_ids.push(
          new mongo.ObjectId(params.params[v])
        );
      })

      const arr = await test.deleteMany({_id: { $in: deleteMany_ids}});
      return arr;
    } catch (error) {
      console.log("错误：" + error);
    } finally {
      console.log("结束");
      if (conn != null) conn.close();
    }
  },
  updateOne: async function (options) {
    let conn = null;
    const document_name = options.documentName || documentName;
    const time = Date.now();
    mongo = require('mongodb')
    const data ={
      ...options.data,
      time: time,
    } || {};
    const filter ={
      ...options.filter,
      status: 1,
    } || {};
    filter._id = new mongo.ObjectId(filter._id);
    try {
      conn = await MongoClient.connect(url);
      const test = conn.db(dbName).collection(document_name);
      // 增加
      // console.log(data);
      await test.updateOne(filter,{$set:data});
    } catch (error) {
      console.log("错误：" + error);
    } finally {
      if (conn != null) conn.close();
    }
  },
};

// dataOperate();
module.exports = CURD_DB;
