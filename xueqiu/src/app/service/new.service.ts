import { Injectable } from '@angular/core';
import axios from 'axios';

import { base } from '../api/baseApi';
@Injectable({
  providedIn: 'root',
})
export class NewService {
  // 后台端口地址
  public port = base.port;
  public protocol = base.protocol;
  public hostname = base.hostname;

  public baseUrl = '';

  constructor() {
    this.baseUrl = this.protocol + '//' + this.hostname + ':' + this.port;
  }

  // 获取图片数据
  async getImageData(): Promise<any> {
    const httpUrl = this.baseUrl + '/api/index/quote';
    let promise;
    try {
      promise = await axios.get(httpUrl);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 雪球热帖
  async getHotList(): Promise<any> {
    const httpUrl = this.baseUrl + '/api/index/hotList';
    let promise;
    try {
      promise = await axios.get(httpUrl);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 7*24
  async getNews(): Promise<any> {
    const httpUrl = this.baseUrl + '/api/index/news';
    let promise;
    try {
      promise = await axios.get(httpUrl);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 获取行业
  async getIndustries(): Promise<any> {
    const httpUrl = this.baseUrl + '/api/screener/industries';
    let promise;
    try {
      promise = await axios.get(httpUrl);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 获取地区
  async getArea(): Promise<any> {
    const httpUrl = this.baseUrl + '/api/screener/area';
    let promise;
    try {
      promise = await axios.get(httpUrl);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 条件股票
  async getcstock(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/screener/stocks';
    let promise;
    try {
      promise = await axios.get(httpUrl, { params: options.params });
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 获取筛选工具
  async getTools(): Promise<any> {
    const httpUrl = this.baseUrl + '/api/screener/Tools';
    let promise;
    try {
      promise = await axios.get(httpUrl);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 获取字段范围
  async getFieldRange(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/screener/fieldRange';
    let promise;
    try {
      promise = await axios.get(httpUrl, { params: options.params });
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 获取筛选的股票
  async getxsStock(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/screener/sxStock';
    let promise;
    try {
      promise = await axios.get(httpUrl, { params: options.params });
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 获取日志
  async getLogList(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/loginCenter/logList';
    let promise;
    try {
      // console.log(options);
      promise = await axios.get(httpUrl, { params: options });
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // write data
  async creatData(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/database/creat';
    let promise;
    try {
      promise = await axios.post(httpUrl, { params: options });
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // write data i 
  async creatDataI(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/database/initalWallet';
    let promise;
    try {
      promise = await axios.post(httpUrl, options);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // update data
  async updateData(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/database/update';
    let promise;
    try {
      promise = await axios.post(httpUrl, options);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // write data i 
  async deteleData(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/database/deteleData';
    let promise;
    try {
      promise = await axios.post(httpUrl, options);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  // 获取广告
  async getAdvertList(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/loginCenter/advertList';
    let promise;
    try {
      promise = await axios.get(httpUrl, { params: options.params });
    } catch (error) {
      throw error;
    }
    return promise.data;
  }
  // 删除广告
  async deleteAdvertList(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/loginCenter/deleteAdvert';
    let promise;
    try {
      promise = await axios.delete(httpUrl, { params: options });
    } catch (error) {
      throw error;
    }
    return promise.data;
  }
  //finnhub profile
  async searchStock(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/index/searchStock';
    let promise;
    try {
      promise = await axios.get(httpUrl,{ params: options });
      // console.log(promise);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  //finnhub profile
  async finhubPeers(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/index/finnhubpeers';
    let promise;
    try {
      promise = await axios.get(httpUrl,{ params: options });
      // console.log(promise);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  //finnhub stock
  async finnhubQuote(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/index/finnhubquote';
    let promise;
    try {
      promise = await axios.get(httpUrl,{ params: options });
      // console.log(promise);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  //搜索polygonaggs
  async polygonAggs(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/index/search/polygonaggs';
    let promise;
    try {
      promise = await axios.get(httpUrl,{ params: options });
      // console.log(promise);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }

  //marketstatus
  async marketStatus(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/index/marketstatus';
    let promise;
    try {
      promise = await axios.get(httpUrl,{ params: options });
      // console.log(promise);
    } catch (error) {
      throw error;
    }
    return promise.data;
  }
}
