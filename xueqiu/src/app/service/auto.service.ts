import { Injectable } from '@angular/core';
import axios from 'axios';

import { base } from '../api/baseApi';
@Injectable({
  providedIn: 'root',
})
export class AutoService {
  // 后台端口地址
  public port = base.port;
  public protocol = base.protocol;
  public hostname = base.hostname;

  public baseUrl = '';

  constructor() {
    this.baseUrl = this.protocol + '//' + this.hostname + ':' + this.port;
  }

  
  //自动完成
  async autoComplate(options): Promise<any> {
    const httpUrl = this.baseUrl + '/api/index/autocom';
    let promise;
    try {
      promise = await axios.get(httpUrl,{ params: options });
    } catch (error) {
      throw error;
    }
    return promise.data;
  }
}
