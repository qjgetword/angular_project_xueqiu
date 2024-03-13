import { Component, OnInit,NgZone } from '@angular/core';

import { ActivatedRoute,Router } from '@angular/router';

import { AppService } from 'src/app/app.service';


// 导入服务
import { NewService } from 'src/app/service/new.service';

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
  buytotal = 0.00;
  walletmoney = 0;

  protfolio = null;
  boughtQuantity = 0;
  boughtTotal = 0;

  peers= Array();

  buySuccess = 'Bought';

  timer: any;

  tabs = "Summary";

  constructor(public server: NewService, public route: ActivatedRoute,private ngZone:NgZone, public router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
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
            this.tabsChanges('Summary');
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

              this.priceH = result.h;
              this.pricel = result.l;
              this.priceo = result.o;
              this.pricep = result.pc;

              //update price when open
              if(this.marketstatus == 'open')
                this.timer = setInterval(() => {
                  this.ngZone.run(() => {
                    // 在此处添加要执行的代码
                    const promiseQuote = this.server.finnhubQuote(paramsSearch);
                    promiseQuote.then((resultZ)=>{
                      this.polygonAggsVw = Number(resultZ.c);
                      this.polygonAggsPriceC = Number(resultZ.d);
                      this.polygonAggsPercent = Number(resultZ.dp);
                      this.polygonAggsPercent = this.polygonAggsPercent.toFixed(2);
                      let usUnixTime = Number(new Date());
                      this.marketstatus =  usUnixTime - this.marketServerTime < 60000 ? "open" : "closed";

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
    let saveData = {
      ticker:this.hostList['ticker'],
      name:this.hostList['name'],
      vw:this.polygonAggsVw,
      percent:this.polygonAggsPercent,
      price:this.polygonAggsPriceC
    }

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
      params: {
        
      }
    };
    const Promise = this.server.getLogList(options);
    Promise.then((result) => {
      if(result.length > 0){
        this.walletmoney = result[0].money;

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
    this.buytotal = this.polygonAggsVw * parseFloat(quantity);
    this.buytotal = isNaN(this.buytotal) ? 0 : this.buytotal;
  }

  buy(quantity):void{
    let params = {
      ticker:this.ticker,
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

  

  
}


