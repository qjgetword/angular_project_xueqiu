// 
const CURD = require("./mongo/CURD_DB");

// 
const OperationLog = {
  // 
  getOperationLog: function getLog(params) {
    const promise = CURD.findDB(params);
    return promise;
  },

  // 
  writeOperationLog: function writeLog(options) {

    CURD.creatDB(options);
  },


  updateOperation: function updateOne(options) {
    CURD.updateDB(options);
  },
  updateOneOperation: function updateOne(options) {
    CURD.updateOne(options);
  },


  deleteOperationLog: function deleteLog(params) {
    return CURD.deleteDB(params);
  },


  delOperationLog: function deleteLog(params) {
    return CURD.del(params);
  },
  delManyOperationLog: function deleteLog(params) {
    return CURD.delMany(params);
  }
};

module.exports = OperationLog;
