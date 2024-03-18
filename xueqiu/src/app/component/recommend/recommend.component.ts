import { Component, OnInit,NgZone,ElementRef } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { AppService } from 'src/app/app.service';

import * as Highcharts from 'highcharts/highstock';

import { NewService } from 'src/app/service/new.service';

import IndicatorsCore from 'highcharts/indicators/indicators';
import volumebyprice from 'highcharts/indicators/volume-by-price';

IndicatorsCore(Highcharts);
volumebyprice(Highcharts);

// 接口对应
const tabObj = {
  recommend: -1,
  liveNews: 6,
  hushen: 105,
  kechaung: 115,
};


@Component({
  selector: 'app-recommend',
  templateUrl: './recommend.component.html',
  styleUrls: ['./recommend.component.less'],
})
export class RecommendComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts; // required
  chartConstructor: string = 'stockChart'; // optional string, defaults to 'chart'
  // chartOptions: Highcharts.Options = { series: [{
  //   data: [1, 2, 3],
  //   type: 'line',
  //   accessibility:{enabled: false} 
  // }] }; // required
  updateFlag: boolean = false; // optional boolean
  oneToOneFlag: boolean = true; // optional boolean, defaults to false
  runOutsideAngular: boolean = false; // optional boolean, defaults to false
  

  coption= {};

  hostList = [];
  polygonAggsVw = 0.00;
  polygonAggsPriceC;
  polygonAggsPercent;
  polygonAggsTime;

  priceH = 0.00;
  pricel = 0.00;
  priceo = 0.00;
  pricep = 0.00;

  finnhunbQuote;

  ticker = '';

  marketstatus;
  marketServerTime;

  isWatchlist;

  buyResult = false;
  buytotal;
  walletmoney = 0;

  protfolio = null;
  boughtQuantity = 0;
  boughtTotal = 0;

  peers= Array();

  buySuccess = 'Bought';

  timer: any;

  tabs = "Summary";
  tabFrom;
  tabto;

  topNews = [];
  topNewsDetail;

  chartsData = [];
  chartoption = {};

  insightsData = [];
  insightsoption;

  earningOption;

  msprPositive;msprNagtive;msprTotal;
  changePositive;changeNagtive;changeTotal;

  constructor(public server: NewService, public route: ActivatedRoute,private ngZone:NgZone, public router: Router,private el:ElementRef) {}

  ngOnInit(): void {

    this.route.params.subscribe((params) => {
      if(params.ticker == 'home'){
        return;
      }

      if(params.ticker && params.ticker.length > 1){
        var paramsSearch = { key: params.ticker.toUpperCase()};
        const promise = this.server.searchStock(paramsSearch);
        promise
          .then((result) => {
            //换成数组
            let arr = [];  
            Object.keys(result).map(function(key){  
                arr[key] = result[key];
            });  
            
            this.hostList = arr;
            // console.log(this.hostList);
            if(!this.hostList['ticker']){
              this.hostList['f'] = true;
              return true;
            }{
              this.hostList['f'] = false;
              this.tabsChanges('Summary');
            }
            
          })
          .catch((err) => {
            // console.log(err);
            throw err;
          });
          
        //search polygon
        const pPromise = this.server.polygonAggs(paramsSearch);
        pPromise
          .then((result) => {
            this.ticker = result.ticker;

            //finnhub quote
            const promiseQuote = this.server.finnhubQuote(paramsSearch);
            promiseQuote.then((result)=>{

              this.polygonAggsVw = Number(result.c);
              this.polygonAggsPriceC = Number(result.d);
              this.polygonAggsPercent = Number(result.dp);
              this.polygonAggsPercent = this.polygonAggsPercent.toFixed(2);
              
              this.marketServerTime= Number(result.t)*1000;

              let usUnixTime = Number(new Date());
              this.marketstatus =  usUnixTime - this.marketServerTime < 5 * 60 * 1000 ? "open" : "closed";

              //summary charts
              this.candlestickAndVolume();

              this.priceH = result.h;
              this.pricel = result.l;
              this.priceo = result.o;
              this.pricep = result.pc;
              // console.log(this.marketServerTime);
              //update price when open
              if(this.marketstatus == 'open')
                this.timer = setInterval(() => {
                  this.ngZone.run(() => {
                    const promiseQuote = this.server.finnhubQuote(paramsSearch);
                    promiseQuote.then((resultZ)=>{
                      this.polygonAggsVw = Number(resultZ.c);
                      this.polygonAggsPriceC = Number(resultZ.d);
                      this.polygonAggsPercent = Number(resultZ.dp);
                      this.polygonAggsPercent = this.polygonAggsPercent.toFixed(2);
                      let usUnixTime = Number(new Date());
                      this.marketstatus =  usUnixTime - this.marketServerTime < 5 * 60000 ? "open" : "closed";

                      this.priceH = result.h;
                      this.pricel = result.l;
                      this.priceo = result.o;
                      this.pricep = result.pc;
                    })
                  });
                }, 15000); 

            }).catch((err) => {
                // console.log(err);
                throw err;
            });
            
            
            // console.log(result);
            if(typeof result.results == "object"){

              //searchWatchList
              const options = {
                documentName: 'watchlist',
                params: {
                  ticker:this.ticker
                  }
                }
              const Promise = this.server.getLogList(options);
              Promise.then((result)=>{
                this.isWatchlist = result.length;
                // console.log(result);

              }) .catch((err) => {
                // console.log(err);
                throw err;
              });

              //search protfolio
              let optionsPf = {
                documentName: 'protfolio',
                params: {
                  ticker:this.ticker
                  }
                }
              const PromisePf = this.server.getLogList(optionsPf);
              PromisePf.then((resultPf)=>{
                this.protfolio = resultPf;
                
                if(typeof this.protfolio[0] == "object"){
                  //total 

                  resultPf.forEach(element => {
                    this.boughtTotal += element.total;
                    this.boughtQuantity += element.quantity;
                  });

                  this.buySuccess = "bought";
                  
                }

              }) .catch((err) => {
                // console.log(err);
                throw err;
              });

            }

          })
          .catch((err) => {
            // console.log(err);
            throw err;
          });
      }
    });
  }

  //save watchlist
  saveWatchList():void{
    const options = {
      documentName: 'watchlist',
      params: {
        ticker:this.hostList['ticker'],
        name:this.hostList['name'],
        vw:this.polygonAggsVw,
        percent:this.polygonAggsPercent,
        price:this.polygonAggsPriceC
      }
    }
      // console.log(options);
      

    const savePromise = this.server.creatData(options);
      savePromise.
        then((results) => {
          this.isWatchlist = results == 'ok' ? 1 : 0;
      })
      .catch((err) => {
        // console.log(err);
        throw err;
      });
      
  }

  buyModal():void{
    //searchwallet
    const options = {
      documentName: 'wallet',
      params: {}
    };
    const Promise = this.server.getLogList(options);
    Promise.then((result) => {
      if(result.length > 0){
        this.walletmoney = result[0].money;

        //again get protfolio
        //search protfolio
        let optionsPf = {
          documentName: 'protfolio',
          params: {
            ticker:this.ticker
            }
          }
        const PromisePf = this.server.getLogList(optionsPf);
        PromisePf.then((resultPf)=>{
          this.protfolio = resultPf;
          
          if(typeof this.protfolio[0] == "object"){
            //total 

            resultPf.forEach(element => {
              this.boughtTotal += element.total;
              this.boughtQuantity += element.quantity;
            });

            this.buySuccess = "bought";
            
          }

        }) .catch((err) => {
          // console.log(err);
          throw err;
        });

      }else{
        //inital account
        const options = {
          documentName: 'wallet',
          params: {
            money:25000,
          }
        }
        
        const savePromise = this.server.creatDataI(options);
        savePromise.
          then((results) => {
            // console.log(results);
            this.walletmoney = 25000;
        })
        .catch((err) => {
          // console.log(err);
          throw err;
        });
      
      }
    })
  }

  calculateBuyQuantity(quantity):void{
    this.buytotal = (this.polygonAggsVw * parseFloat(quantity)).toFixed(2);
    this.buytotal = isNaN(this.buytotal) ? 0 : this.buytotal;
  }

  buy(quantity):void{
    let params = {
      ticker:this.ticker,
      name:this.hostList['name'],
      pricevw:this.polygonAggsVw,
      quantity:parseFloat(quantity),
      total:this.buytotal
    };

    const options = {
      documentName: 'protfolio',
      params: params
    }
    
    const savePromise = this.server.creatDataI(options);
    savePromise.
      then((results) => {
        this.buyResult = results == "ok" ? true : false;
        if(this.buyResult === true){
          this.boughtQuantity = params.quantity;
          this.boughtTotal = params.total;

          //consume
          let options = {
            documentName: 'wallet',
            params:{
              money: this.walletmoney - this.buytotal
            }
          };
          const savePromise = this.server.updateData(options);
          savePromise.
            then((results) => {
              // console.log(results);
              this.buySuccess = "Bought";
          })
        }
    })
    .catch((err) => {
      // console.log(err);
      throw err;
    });

  }


  sell():void{
    let params = {
      ticker:this.ticker,
    };

    //sell
    const options = {
      documentName: 'protfolio',
      params: params
    }
    
    const savePromise = this.server.deteleData(options);
    savePromise.
      then((results) => {
        this.buyResult = results == "ok" ? true : false;
        if(this.buyResult === true){
          //consume
          let options = {
            documentName: 'wallet',
            params:{
              money: this.walletmoney + this.boughtQuantity * this.polygonAggsVw
            }
          };
          const savePromise = this.server.updateData(options);
          savePromise.
            then((results) => {
              // console.log(results);
              this.boughtTotal = 0;
              this.buySuccess = "Sold";
          })
        }
    })
    .catch((err) => {
      // console.log(err);
      throw err;
    });

  }

  tabsChanges(event):void{
    this.tabs = event;

    switch(event){
      case'Summary':
        const Promise = this.server.finhubPeers({ key: this.hostList['ticker']});
        Promise.then((resultFp) => {
          this.peers = resultFp;
        });
        break;
      case 'Top News':
        if(this.topNews.length > 1 || this.ticker?.length == 0) {break;}
        this.topNewsTab();
        break;
      case 'Charts':
        if(this.chartsData.length > 1) {break;}
        this.charts();
        break;
      case 'InSights':
        if(this.insightsData.length > 1) {break;}
        this.insights();
        break;
    }     
    
    
  }

  searchClick(searchword: string): void{
    let searchwordone = searchword.split('|',1);
    const reg = /\s+$/g;
    searchwordone[0] =  searchwordone[0].replace(reg,'');
    this.router.navigate(['search', encodeURIComponent(searchwordone[0])]);
  }

  imageConvert(url): string {
    return AppService.imageConvert(url);
  }

  candlestickAndVolume():void{
    let paramsSearch = {};
    let fromUnixTime = Number(new Date());

    if(this.marketServerTime == undefined ){ return;}

    if(this.marketstatus == 'open'){
      this.tabFrom = fromUnixTime -  24 * 3600 * 1000;
      this.tabto = fromUnixTime;
      
    }else{
      this.tabFrom = this.marketServerTime -  24 * 3600 * 1000;
      this.tabto = this.marketServerTime;

    }

    paramsSearch = { 
      ticker:this.ticker,
      day:1,
      range:"hour",
      from:this.tabFrom,
      to:this.tabto
    };
    let data = [];

    //search polygon
    const pPromise = this.server.polygonAggsTicker(paramsSearch);
    pPromise
      .then((result) => {
        if(typeof result.results == "object"){
          result.results.forEach(element => {
            data.push([element.t,element.c])
          });
          this.coption = {
            chart: {
              backgroundColor:'#F5F5F5'
            },
            rangeSelector: {
                selected: 1
            },
            title: {
                text: this.ticker + ' Stock Price'
            },
            navigator: {
                series: {
                    accessibility: {
                        exposeAsGroupOnly: true
                    }
                }
            },
            series: [{
                name: this.ticker + ' Stock Price',
                data: data,
                type: 'area',
                threshold: null,
                tooltip: {
                    valueDecimals: 2
                },
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                }
            }],
            accessibility:{enabled:false}
          };
        }
      })
      .catch((err) => {
        // console.log(err);
        throw err;
      });
  }
  
  topNewsTab():void{
    let paramsSearch = {
      ticker: this.ticker,
      from:new Date(this.tabFrom).getFullYear() + '-' + String(new Date(this.tabFrom).getMonth() +1).padStart(2,'0') + '-' + + String(new Date(this.tabFrom).getDate()).padStart(2,'0'),
      to:new Date(this.tabto).getFullYear() + '-' + String(new Date(this.tabto).getMonth() +1).padStart(2,'0') + '-' + + String(new Date(this.tabto).getDate()).padStart(2,'0')
    }; 
    const pPromise = this.server.companyNews(paramsSearch);
    pPromise
      .then((result) => {
        this.topNews = result.slice(0,4);
      })
      .catch((err) => {
        // console.log(err);
        throw err;
      });
  }

  newsDetail(n):void{
    this.topNewsDetail = this.topNews[n];
    this.topNewsDetail.headlineencode = encodeURIComponent(this.topNewsDetail?.headline);
    this.topNewsDetail.urlencode = encodeURIComponent(this.topNewsDetail?.url);
    

  }

  charts():void{
    let paramsSearch = { 
      ticker:this.ticker,
      day:1,
      range:"day",
      from:(new Date(this.tabto).getFullYear()-2) + '-' + String(new Date(this.tabto).getMonth() +1).padStart(2,'0') + '-' + + String(new Date(this.tabto).getDate()).padStart(2,'0'),
      to:new Date(this.tabto).getFullYear() + '-' + String(new Date(this.tabto).getMonth() +1).padStart(2,'0') + '-' + + String(new Date(this.tabto).getDate()).padStart(2,'0')
    };

    //search polygon
    const pPromise = this.server.polygonAggsTicker(paramsSearch);
    pPromise
      .then((result) => {
        if(typeof result.results == "object"){

          let ohlc = result.results,
          volume = [],
          // set the allowed units for data grouping
          groupingUnits = [[
              'day',                         // unit name
              [1]                             // allowed multiples
          ], [
              'day',
              [1, 2, 3, 4, 6]
          ]];

          for (let i = 0; i < ohlc.length; i += 1) {
            this.chartsData.push([
              ohlc[i]['t'], // the date
              ohlc[i]['o'], // open
              ohlc[i]['h'], // high
              ohlc[i]['l'], // low
              ohlc[i]['c'] // close
            ]);
    
            volume.push([
              ohlc[i]['t'], // the date
              ohlc[i]['v'] // the volume
            ]);
        }
          
          this.chartoption = {
            chart: {
              backgroundColor:'#F5F5F5'
            },
            rangeSelector: {
                selected: 2
            },
    
            title: {
                text: this.ticker+' Historical'
            },
    
            subtitle: {
                text: 'With SMA and Volume by Price technical indicators'
            },
    
            yAxis: [{
                startOnTick: false,
                endOnTick: false,
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
            }],
    
            tooltip: {
                split: true
            },
    
            plotOptions: {
                series: {
                    dataGrouping: {
                        units: groupingUnits
                    }
                },
                vbp: {
                  // shared options for all vbp series
              }
            },
    
            series: [{
                type: 'candlestick',
                name: this.ticker,
                id: 'aapl',
                zIndex: 2,
                data: this.chartsData
            }, {
                type: 'column',
                name: 'Volume',
                id: 'volume',
                data: volume,
                yAxis: 1
            }, {
                type: 'vbp',
                linkedTo: 'aapl',
                params: {
                    volumeSeriesID: 'volume'
                },
                dataLabels: {
                    enabled: false
                },
                zoneLines: {
                    enabled: false
                }
            }, {
                type: 'sma',
                linkedTo: this.ticker,
                zIndex: 1,
                marker: {
                    enabled: false
                }
            }]
          }
        }
      })
      .catch((err) => {
        // console.log(err);
        throw err;
      });
  }


  insights():void{
    //search insider
    let paramsSearch = {
      ticker:this.ticker,
      from:"2022-01-01"
    };

    const pPromise = this.server.insider(paramsSearch);
    pPromise
      .then((result) => {
        if(result.data.length > 1){
        this.insightsData = result.data;
        let msprP = 0 ; 
        let msprN = 0 ;

        let changeP = 0 ; 
        let changeN = 0 ;

        result?.data.forEach(element => {

          msprP += element.mspr >= 0 ? element.mspr : 0 ;
          msprN += element.mspr < 0 ? element.mspr : 0 ;

          changeP += element.change >= 0 ? element.change : 0 ;
          changeN += element.change < 0 ? element.change : 0 ;
        });
        let msprT = msprP + msprN;
        let changeT = changeP + changeN;

        this.msprPositive = msprP.toFixed(2);
        this.msprNagtive = msprN.toFixed(2);
        this.msprTotal = msprT.toFixed(2);

        this.changePositive = changeP;
        this.changeNagtive = changeN;
        this.changeTotal = changeT;
      }

      })
      .catch((err) => {
        // console.log(err);
        throw err;
      });

    //search recommendation
    const rPromise = this.server.recommendation({ticker:this.ticker});
    rPromise
      .then((result) => {
        if(result?.length > 0){
          this.insightsoption = {
            chart: {
                type: 'column',
                backgroundColor:'#F5F5F5'
            },
            title: {
                text: 'Recommendation Trends',
                align: 'center',
                style:{fontWeight:'bold'}
            },
            xAxis: {
                categories: [result[0].period, result[1].period, result[2].period, result[3].period]
            },
            yAxis: {
                min: 0,
                title: {
                    text: '#Analysis',
                    textAlign:'left'
                },
                stackLabels: {
                    enabled: true
                }
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                shadow: false
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            series: [{
                name: 'Strong Buy',
                color:'#006633',
                data: [result[0].strongBuy, result[1].strongBuy, result[2].strongBuy, result[3].strongBuy]
            }, {
                name: 'Buy',
                color:'#339933',
                data: [result[0].buy, result[1].buy, result[2].buy, result[3].buy]
            },  {
                name: 'Hold',
                color:'#CC9933',
                data: [result[0].hold, result[1].hold, result[2].hold, result[3].hold]
            },  {
                name: 'Sell',
                color:'#CC3300',
                data: [result[0].sell, result[1].sell, result[2].sell, result[3].sell]
            },  {
                name: 'Strong Sell',
                color:'#660000',
                data: [result[0].strongSell, result[1].strongSell, result[2].strongSell, result[3].strongSell]
            }]
        };
        }
      })
      .catch((err) => {
        // console.log(err);
        throw err;
      });
    
    //search earning
    const ePromise = this.server.earning({ticker:this.ticker});
    ePromise
      .then((result) => {
        if(result?.length > 0){
            result.forEach((element,index) => {
              result[index].actual = element.actual == null ? 0 : element.actual;
              result[index].estimate = element.estimate == null ? 0 : element.estimate;
              result[index].surprise = element.surprise == null ? 0 : element.surprise;
              result[index].surprisePercent = element.surprisePercent == null ? 0 : element.surprisePercent;
            });

            let a = [[result[0].surprise,result[0].actual],
            [result[1].surprise,result[1].actual],
            [result[2].surprise,result[2].actual],
            [result[3].surprise,result[3].actual]
          ];

            this.earningOption = {
              chart: {
                  type: 'spline',
                  backgroundColor:'#F5F5F5'
              },
              title: {
                  text: 'Historical EPS Surprise',
                  align: 'center'
              },
              xAxis: {
                  categories: [result[0].period+"<br/>Surprise:"+result[0].surprise, 
                    result[1].period+"<br/>Surprise:"+result[1].surprise, 
                    result[2].period+"<br/>Surprise:"+result[2].surprise, 
                    result[3].period+"<br/>Surprise:"+result[3].surprise],
                  reversed: false,
                  title: {
                      enabled: true,
                      // text: 'Quarterly EPS'
                  },
                  labels: {
                      format: '{value}'
                  },
                  accessibility: {
                      rangeDescription: 'Range: 0 to 10'
                  },
                  maxPadding: 0.05,
                  showLastLabel: true
              },
              yAxis: {
                  title: {
                    enabled: true,
                    text: 'Quarterly EPS'
                  },
                  labels: {
                      format: '{value}'
                  },
                  accessibility: {
                      rangeDescription: 'Range: -90°C to 20°C.'
                  },
                  lineWidth: 2
              },
              tooltip: {
                  headerFormat: '<b>{series.name}</b><br/>',
                  pointFormat: '{point.x}: {point.y}'
              },
              plotOptions: {
                  spline: {
                      marker: {
                          enable: false
                      }
                  }
              },
              series: [{
                  name: 'Actual',
                  data: [result[0].actual,
                    result[1].actual,
                    result[2].actual,
                    result[3].actual
                  ]
              }
              ,{
                  name: 'Estimate',
                  data: [result[0].estimate,
                  result[1].estimate,
                  result[2].estimate,
                  result[3].estimate
                  ]
              }
            ]
            };


        }
      })
      .catch((err) => {
        // console.log(err);
        throw err;
      });
    
      
  }
}


