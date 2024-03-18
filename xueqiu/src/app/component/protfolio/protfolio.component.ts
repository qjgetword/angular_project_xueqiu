import { CommonModule } from '@angular/common';
import { Component, } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NewService } from 'src/app/service/new.service';

@Component({
  selector: 'app-protfolio',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './protfolio.component.html',
  styleUrl: './protfolio.component.less'
})
export class ProtfolioComponent {
  objectKeys = Object.keys;
  constructor(private service:NewService,
    ){}

  buyList = [];

  walletmoney = -1;

  protfolio;
  protfolioKey = [];

  isLoading = true;

  buyTicker = '';
  buytotal;
  buyResult = false;
  buySuccess = 'Bought';
  successClass = 'alert-success';
  bsInput = 0;


  ngOnInit(): void {

    const options = {
      documentName: 'wallet',
      params: {}
    };
    const Promise = this.service.getLogList(options);
    Promise.then((result) => {
      if(result[0]?.length == 0){
        //inital account
        const options = {
          documentName: 'wallet',
          params: {
            money:25000,
          }
        }
      
        const savePromise = this.service.creatDataI(options);
        savePromise.
          then((results) => {
            // console.log(results);
            this.walletmoney = 25000;
        })
        .catch((err) => {
          // console.log(err);
          throw err;
        });
      }else{
        // result[0].
        this.walletmoney = parseFloat(result[0].money.toFixed(2));
        this.updateProtfolio();
      }

    }) .catch((err) => {
      throw err;
    });
  }

  updateProtfolio():void{
    //search protfolio
    let optionsPf = {
      documentName: 'protfolio',
      params: {}
      }
    const PromisePf = this.service.getLogList(optionsPf);
    PromisePf.then((result)=>{
      if(result?.length == 0) { this.protfolio = result; return ;}
      this.buyList = result;
      let tempObj : any= {};
      let quantities = [];
      let total = [];
      result.forEach(element => {
        
        if(quantities[element.ticker] > 0){
          quantities[element.ticker] +=  element.quantity;
          total[element.ticker] +=  (element.quantity * element.pricevw);
        }else{
          quantities[element.ticker] = element.quantity;
          total[element.ticker] =  (element.quantity * element.pricevw);
        }
        
        tempObj[element.ticker] = {
          ticker:element.ticker,
          name:element.name,
          quantity:quantities[element.ticker],
          total:parseFloat(total[element.ticker].toFixed(2)),
          avg:parseFloat((total[element.ticker]/quantities[element.ticker]).toFixed(2))
        };

      });

      this.protfolioKey = Object.keys(tempObj);

      this.protfolioKey.forEach(key => {
        //finnhub quote
        const promiseQuote = this.service.finnhubQuote( {key: key});
        promiseQuote.then((resultq)=>{
          tempObj[key].currentPrice = parseFloat(resultq.c.toFixed(2));
          tempObj[key].change = parseFloat((tempObj[key].avg - resultq.c).toFixed(2));
          
          if(tempObj[key].currentPrice > tempObj[key].avg){
            tempObj[key].class = 'text-success';
          }else{
            tempObj[key].class = tempObj[key].currentPrice == tempObj[key].avg ? 'text-dark' : 'text-danger';
          }
          
        }).catch((err) => {
          // console.log(err);
          throw err;
        });
        this.protfolio = tempObj;
        this.isLoading = false;
      });

    }) .catch((err) => {
      // console.log(err);
      throw err;
    });
  }

  buyModal(ticker,buyquantity):void{
    if(ticker != this.buyTicker){
      // this.bsInput = 0;
    }

    this.buyTicker = ticker; 
    this.calculateBuyQuantity(buyquantity);
  }

  calculateBuyQuantity(quantity):void{
    this.buytotal = parseFloat((this.protfolio[this.buyTicker].currentPrice * parseFloat(quantity)).toFixed(2));
    this.buytotal = isNaN(this.buytotal) ? 0 : this.buytotal;
  }

  buy(quantity,buyTicker):void{
    let params = {
      ticker:buyTicker,
      name:this.protfolio[buyTicker].name,
      pricevw:this.protfolio[buyTicker].currentPrice,
      quantity:parseFloat(quantity),
      total:this.buytotal
    };

    const options = {
      documentName: 'protfolio',
      params: params
    }
    
    const savePromise = this.service.creatDataI(options);
    savePromise.
      then((results) => {
        this.buyResult = results == "ok" ? true : false;
        if(this.buyResult === true){
          //consume
          let options = {
            documentName: 'wallet',
            params:{
              money: this.walletmoney - this.buytotal
            }
          };
          const savePromise = this.service.updateData(options);
          savePromise.
            then((results) => {
              this.buySuccess = "Bought";
              this.successClass = 'alert-success';
              this.updateProtfolio();
              let timer = null;
              this.buyResult = true;
              timer = setTimeout(() => {
                  this.buyResult = false;
              }, 5000);
          })
        }
    })
    .catch((err) => {
      // console.log(err);
      throw err;
    });
  }

  sell(quantity,buyTicker):void{

    let tempQuantity = 0;
    let delId = [];
    let updateId :any =[];
    try{
      this.buyList.forEach(element => {
        if (element.ticker == buyTicker){
          tempQuantity += element.quantity;
          if(tempQuantity == quantity){
            delId.push(element._id);
            throw new Error('e');
          }else if(tempQuantity < quantity){
            delId.push(element._id);
          }else{
            updateId.push({'_id':element._id,'sellQuantity':element.quantity - (quantity - (tempQuantity - element.quantity))})
            throw new Error('e');
          }
        }
      });

    }catch(e){
      // throw e;
    }

    if(delId.length > 0){
      const options = {
        documentName: 'protfolio',
        params:delId
      }
      //del
      const savePromise = this.service.delMany(options);
      savePromise.
        then((results) => {
          //update 
          if(updateId.length > 0){
            let options = {
              documentName: 'protfolio',
              data:{ quantity:updateId[0].sellQuantity,},
              filter: { _id:updateId[0]._id,},
            }

            const Promise = this.service.updateOne(options);
            Promise.then((results) => {
              this.buySuccess = "Sold";
              this.successClass = 'alert-danger';
              this.buyResult = true;
              this.updateProtfolio();
              let timer = null;
              timer = setTimeout(() => {
                this.buyResult = false;
              }, 5000);
            }).catch((err) => {
              // console.log(err);
              throw err;
            });
          }else{
            this.buySuccess = "Sold";
            this.successClass = 'alert-danger';
            this.buyResult = true;
            this.updateProtfolio();
            let timer = null;
            timer = setTimeout(() => {
              this.buyResult = false;
            }, 5000);
          }
  
        })
        .catch((err) => {
          // console.log(err);
          throw err;
      });

    }else if(updateId.length > 0){

      //update
      let options = {
        documentName: 'protfolio',
        data:{ quantity:updateId[0].sellQuantity,},
        filter: { _id:updateId[0]._id,},
      }

      const Promise = this.service.updateOne(options);
      Promise.then((results) => {
        this.buySuccess = "Sold";
        this.successClass = 'alert-danger';
        this.buyResult = true;
        this.updateProtfolio();
        let timer = null;
        timer = setTimeout(() => {
          this.buyResult = false;
        }, 5000);

      }).catch((err) => {
        // console.log(err);
        throw err;
      });
    }

    this.consumeWallet(quantity,buyTicker);
  }

    consumeWallet(quantity,buyTicker):void{
      let options = {
          documentName: 'wallet',
          params:{
            money: parseFloat((this.walletmoney + parseFloat(this.protfolio[buyTicker].currentPrice) * parseFloat(quantity)).toFixed(2))
          }
      }
      const savePromise = this.service.updateData(options);
        savePromise.
          then((results) => {
            this.updateProtfolio();
            this.walletmoney = options.params.money;
        })
    }
    
}
