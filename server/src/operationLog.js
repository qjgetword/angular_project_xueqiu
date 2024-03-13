// 导入操作数据库方法
const CURD = require("./mongo/CURD_DB");

// 操作日志记录
const OperationLog = {
  // 获取日志
  getOperationLog: function getLog(params) {
    const promise = CURD.findDB(params);
    return promise;
  },

  // 写日志
  writeOperationLog: function writeLog(options) {
    // const api = options.url;
    // console.log(time, api);
    // const time = Date.now();
    // var params = {
    //   time: time,
    //   api: api,
    // };
    CURD.creatDB(options);
  },

  // 写日志
  updateOperation: function updateOne(options) {
    CURD.updateDB(options);
  },

  // 删日志
  deleteOperationLog: function deleteLog(params) {
    return CURD.deleteDB(params);
  },
};

module.exports = OperationLog;
