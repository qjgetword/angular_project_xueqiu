const express = require("express");

const axios = require("axios");

const { getIp } = require("./src/ip");

const app = express();

// 通过 express.json() 中间键解析表单中的 json 数据
app.use(express.json()); // 数据JSON类型

// 通过 express.urlencoded() 中间键解析表达中的 url-encoded 数据
app.use(express.urlencoded({ extended: false })); //解析post请求数据

// 导入操作日志模块
const OperationLog = require("./src/operationLog");

// 读取本地数据
const readFile = require("./src/readFixtures");
// import readFile from "./src/readFixtures";

// 导入路径模块

// 获取认证
const cookie = require("./cookie");

// 监听端口
const port = 8080;

const finnhubkey = 'cnjcqopr01qkq94ge8fgcnjcqopr01qkq94ge8g0';

// axios 全局配置
// axios全局设置网络超时
axios.defaults.timeout = 30 * 1000; // 30s
axios.defaults.headers.common["quYunZhao"] = "nice";

// 添加中间间
// 添加请求头
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append("Access-Control-Allow-Content-Type", "*");
  res.append("Access-Control-Allow-Headers", "*");
  res.append("Access-Control-Allow-Methods", "*");
  next();
});

// 判断接口是否请求成功
// 成功用原数据
// 失败采用本地数据
function readJson(req) {
  axios.interceptors.response.use(
    (response) => {
      // console.log("成功", response.status);
      // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
      // 否则的话抛出错误
      if (response.status === 200) {
        return Promise.resolve(response);
      } else {
        return Promise.reject(response);
      }
    },
    (error) => {
      const reqURL = req.url;
      var result = readFile.readAsync(reqURL);
      return Promise.reject(result);
    }
  );
}
// 调用本地数据
app.use((req, res, next) => {
  readJson(req);
  next();
});

// 记录操作日志
app.use((req, res, next) => {
  res.setHeader("remoteAddress", req.socket.remoteAddress);
  res.setHeader("x-forwarded-for", req.headers["x-forwarded-for"] || "1");
  res.setHeader("x-real-ip", req.headers["x-real-ip"] || "1");
  const options = {
    documentName: "api",
    params: {
      text: req.url,
      api: req.url,
      ip: getIp(req),
      remoteAddress: req.socket.remoteAddress,
    },
  };
  // 写日志
  OperationLog.writeOperationLog(options);
  next();
});

const options = {
  // `headers` 是即将被发送的自定义请求头
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
    origin: "https://xueqiu.com",
    referer: "https://xueqiu.com/",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    cookie: cookie,
  },
};

app.get("/", (req, res) => {
  res.send("apiServer运行中...");
});

/* ---------- 获取本地数据---------- */
app.get("/fixtures/quote", (req, res) => {
  // const httpUrl = fixtures + "quote.json";
  const httpUrl = "http://127.0.0.1:5500/server/fixtures/quote.json";

  const promise = axios.get(httpUrl, {});
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.json(err);
    });
});

/* ----------------后台数据 --------*/

// 指数数据
app.get("/api/index/quote", (req, res) => {
  const httpUrl = "https://stock.xueqiu.com/v5/stock/batch/quote.json";

  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      symbol:
        "SH000001,SZ399001,SZ399006,SH000688,HKHSI,HKHSCEI,HKHSCCI,.DJI,.IXIC,.INX",
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 雪球热帖
app.get("/api/index/hotList", (req, res) => {
  const httpUrl = "https://xueqiu.com/statuses/hot/listV2.json";

  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 15,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 7*24
app.get("/api/index/news", (req, res) => {
  const httpUrl = "https://xueqiu.com/statuses/livenews/list.json";

  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      count: 15,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 热股榜
app.get("/api/index/hotStock", async (req, res) => {
  /* 10 全球
   * 11 美股
   * 12 沪深
   * 13 港股
   **/

  const index = req.query.index || 12;
  const httpUrl = `https://stock.xueqiu.com/v5/stock/hot_stock/list.json`;

  let result;
  try {
    result = await axios.get(httpUrl, {
      ...options,
      params: {
        size: 8,
        _type: index,
        type: index,
      },
    });
  } catch (error) {
    res.send(err);
  }
  res.json(result.data);
});

// 股票筛选的数据
app.get("/api/screener/Tools", async (req, res) => {
  // 获取首页
  const httpUrl = `https://xueqiu.com/hq/screener`;

  let result;
  let content;
  try {
    result = await axios.get(httpUrl, options);
    // 设置正则
    let reg = /SNB.data.condition =(.*?);/gis;
    // 匹配内容
    // const content = result.data.match(reg);
    content = reg.exec(result.data)[1];
    res.send(content);
  } catch (error) {
    res.send(error);
  }
});

// 本周新增
app.get("/api/screener/stocks", (req, res) => {
  const httpUrl = "https://xueqiu.com/service/screener/screen";

  const orderBy = req.query.order_by || "follow7d";
  const order = req.query.order || "desc";
  const time = new Date().getTime;
  // follow （关注人数）   最热门
  // follow7d (关注人数)   本周新增
  // tweet （讨论条数）     最热门
  // tweet7d （讨论条数）  本周新增
  // deal 分享交易         最热门
  // deal7d 分享交易      本周新增

  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      category: "CN",
      size: 10,
      order: order,
      order_by: orderBy,
      only_count: 0,
      page: 1,
      _: time,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 获取行业信息
app.get("/api/screener/industries", async (req, res) => {
  // 获取首页
  const httpUrl = `https://xueqiu.com/service/screener/industries`;
  const time = new Date().getTime;

  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      category: "CN",
      _: time,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 获取区域信息
app.get("/api/screener/area", async (req, res) => {
  // 获取首页
  const httpUrl = `https://xueqiu.com/service/screener/areas`;
  const time = new Date().getTime;

  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      _: time,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 获取最大最小值
app.get("/api/screener/fieldRange", async (req, res) => {
  // 获取首页
  const httpUrl = `https://xueqiu.com/service/screener/values`;
  const time = new Date().getTime;
  const date = "20210331";
  const field = req.query.field || "npana";

  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      _: time,
      category: "CN",
      field: field + "." + date,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 筛选股票
app.get("/api/screener/sxStock", async (req, res) => {
  const httpUrl = "https://xueqiu.com/service/screener/screen";
  const params = req.query;
  const promise = axios.get(httpUrl, {
    ...options,
    params: params,
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// get data
app.get("/api/loginCenter/logList", async (req, res) => {
  const params = req.query;
  const documentName = req.query.documentName;

  const options = {
    documentName: documentName,
    params: { ...params, ip: getIp(req) },
  };
  const promise = OperationLog.getOperationLog(options);
  promise
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// write
app.post("/api/database/creat", async (req, res) => {
  const params = req.body;

  resultReturn = [];

  const documentName = 'watchlist';
  const options = {
    documentName: documentName,
    params: { ...params, ip: getIp(req) },
  };
  // console.log(options);
  OperationLog.writeOperationLog(options);
  res.send("ok");
});

  // inital wallet
  app.post("/api/database/initalWallet", async (req, res) => {
    const params = req.body;
  
    resultReturn = [];
  
    const documentName = params.documentName;
    const options = {
      documentName: documentName,
      params: { ...params.params, ip: getIp(req) },
    };
    // console.log(options);
    OperationLog.writeOperationLog(options);
    res.send("ok");
  });

  // update 
  app.post("/api/database/update", async (req, res) => {
    const params = req.body;
  
    resultReturn = [];
  
    const documentName = params.documentName;
    const options = {
      documentName: documentName,
      params: { ...params.params, ip: getIp(req) },
    };

    OperationLog.updateOperation(options);
    res.send("ok");
  });

  // update one
  app.post("/api/database/updateOne", async (req, res) => {
    const params = req.body;
  
    resultReturn = [];

    const documentName = params.documentName;
    const options = {
      documentName: documentName,
      data: params.data ,
      filter: params.filter 
    };

    OperationLog.updateOneOperation(options);
    res.send("ok");
  });

  // delete data
  app.post("/api/database/deteleData", async (req, res) => {
    const params = req.body;
  
    resultReturn = [];
  
    const documentName = params.documentName;
    const options = {
      documentName: documentName,
      params: { ...params.params, ip: getIp(req) },
    };
    OperationLog.deleteOperationLog(options);
    res.send("ok");
  });

  // delete 
  app.post("/api/database/del", async (req, res) => {
    const params = req.body;
  
    resultReturn = [];
  
    const documentName = params.documentName;
    const options = {
      documentName: documentName,
      params: { ...params.params, ip: getIp(req) },
    };
    OperationLog.delOperationLog(options);
    res.send("ok");
  });

  // delete 
  app.post("/api/database/delMany", async (req, res) => {
    const params = req.body;
  
    resultReturn = [];
    const documentName = params.documentName;
    const options = {
      documentName: documentName,
      params: { 
        ...params.params },
    };

    OperationLog.delManyOperationLog(options);
    res.send("ok");
  });


// 获取广告消息
app.get("/api/loginCenter/advertList", async (req, res) => {
  const params = req.query;
  const documentName = "advert";
  const promise = OperationLog.getOperationLog({
    ...params,
    documentName,
  });
  promise
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// delete
app.delete("/api/loginCenter/deleteAdvert", async (req, res) => {
  const params = req.query;
  const documentName = "advert";
  OperationLog.deleteOperationLog({ ...params, documentName });
  res.send("ok");
});

// 监听端口
app.listen(port, () => {
  console.log("server start", "http://localhost:8080");
});


// finnhub search profile2
app.get("/api/index/searchStock", (req, res) => {
  const params = req.query;
  const httpUrl = "https://finnhub.io/api/v1/stock/profile2?symbol="+params.key+"&token="+finnhubkey;
  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 15,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });

   
  });


// finnhub stock price quote
app.get("/api/index/finnhubquote", (req, res) => {
  const params = req.query;
  const httpUrl = "https://finnhub.io/api/v1/quote?symbol="+params.key+"&token="+finnhubkey;
  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 15,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });

});

//finnhub company peers
app.get("/api/index/finnhubpeers", (req, res) => {
  const params = req.query;
  const httpUrl = "https://finnhub.io/api/v1/stock/peers?symbol="+params.key+"&token="+finnhubkey;
  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 15,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });

});

  // 获取polygon
app.get("/api/index/search/polygonaggs", (req, res) => {
  const params = req.query;
  const dt = new Date();
  // 获取时间信息
  const year = dt.getFullYear() // 2021
  const month = dt.getMonth()+1 <10 ?  "0"+ (dt.getMonth()+1) : dt.getMonth()+1 // 8
  const date = dt.getDate()-3<10 ? "0"+(dt.getDate()-3) : (dt.getDate()-3) // 23
  let nextDate = dt.getDate()-1<10 ? "0"+(dt.getDate()-1) : (dt.getDate()-1) // 23

  const httpUrl = "https://api.polygon.io/v2/aggs/ticker/"+params.key.toUpperCase()
      +"/range/3/day/"+year+"-"+month+"-"+date+"/"+year+"-"+month+"-"+nextDate+"?adjusted=true&sort=asc&limit=1&apiKey=o2EmBqhojCYhKBvprIfrmVp3HioTffWh";
  // console.log(httpUrl);
  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 15,
    },
  });
  promise
    .then((result) => {
      // console.log(result);
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
  });

 // get summary charts
 app.get("/api/index/search/polygonaggsticker", (req, res) => {
  const params = req.query;
  const httpUrl = "https://api.polygon.io/v2/aggs/ticker/"+params.ticker
      +"/range/"+params.day+"/"+params.range+"/"+params.from+"/"+params.to+"?adjusted=true&sort=asc&apiKey=o2EmBqhojCYhKBvprIfrmVp3HioTffWh";

  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 15,
    },
  });
  promise
    .then((result) => {
      // console.log(result);
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
  });

  

   // get marketstatus polygon
app.get("/api/index/marketstatus", (req, res) => {

  const httpUrl = "https://api.polygon.io/v1/marketstatus/now?apiKey=o2EmBqhojCYhKBvprIfrmVp3HioTffWh";

  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 15,
    },
  });
  promise
    .then((result) => {
      // console.log(result);
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
  });


// finnhub 自动补全
app.get("/api/index/autocom", (req, res) => {
  const params = req.query;
  const httpUrl = "https://finnhub.io/api/v1/search?q="+params.key+"&token="+finnhubkey;
  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 100,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// finnhub autocompelete
app.get("/api/index/autocom", (req, res) => {
  const params = req.query;
  const httpUrl = "https://finnhub.io/api/v1/search?q="+params.key+"&token="+finnhubkey;
  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 100,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

// finnhub news
app.get("/api/index/companynews", (req, res) => {
  const params = req.query;
  const httpUrl = "https://finnhub.io/api/v1/company-news?symbol="+params.ticker+'&from='+params.from+'&to='+params.to+"&token="+finnhubkey;
  console.log(httpUrl);
  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 100,
    },
  });
  promise
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
});

  // get insider-sentiment polygon https://finnhub.io/api/v1/stock/insider-sentiment?symbol=<TICKER>&from=2022-01-01&token=<API_KEY></API_KEY>
  app.get("/api/index/search/insider", (req, res) => {
  const params = req.query;
  const httpUrl = " https://finnhub.io/api/v1/stock/insider-sentiment?symbol="+params.ticker+"&from="+params.from+"&token="+finnhubkey;
  const promise = axios.get(httpUrl, {
    ...options,
    params: {
      since_id: -1,
      max_id: -1,
      size: 15,
    },
  });
  promise
    .then((result) => {
      // console.log(result);
      res.json(result.data);
    })
    .catch((err) => {
      res.send(err);
    });
  });

  //get recommendation https://finnhub.io/api/v1/stock/recommendation?symbol=<TICKER>&token=<API_KEY>
  app.get("/api/index/search/recommendation", (req, res) => {
    const params = req.query;
    const httpUrl = " https://finnhub.io/api/v1/stock/recommendation?symbol="+params.ticker+"&token="+finnhubkey;
    const promise = axios.get(httpUrl, {
      ...options,
      params: {
        since_id: -1,
        max_id: -1,
        size: 15,
      },
    });
    promise
      .then((result) => {
        // console.log(result);
        res.json(result.data);
      })
      .catch((err) => {
        res.send(err);
      });
    });

  // get company Earning https://finnhub.io/api/v1/stock/earnings?symbol=MSFT&token=<API_KEY>
  app.get("/api/index/search/earning", (req, res) => {
    const params = req.query;
    const httpUrl = " https://finnhub.io/api/v1/stock/earnings?symbol="+params.ticker+"&token="+finnhubkey;
    const promise = axios.get(httpUrl, {
      ...options,
      params: {
        since_id: -1,
        max_id: -1,
        size: 15,
      },
    });
    promise
      .then((result) => {
        // console.log(result);
        res.json(result.data);
      })
      .catch((err) => {
        res.send(err);
      });
    });

