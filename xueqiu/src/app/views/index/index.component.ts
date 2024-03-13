import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
// 导入
import { NewService } from 'src/app/service/new.service';


import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {UntypedFormControl} from '@angular/forms';

import { AutoService } from 'src/app/service/auto.service';

import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.less'],
})

export class IndexComponent implements OnInit {
  // 指数列表
  quoteList = [];

  hostList = [];

  myControl = new UntypedFormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]>;



  private search$ = new Subject<string>();


  // 指数列表位置
  zhishuListPosition = 'translate(0px)';

  // 顶部图片
  // 默认选择第一个
  circleActive = 0;

  // tab 页签默认选中第一个
  tabActiveIndex = 0;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public server: NewService,
    public autoserver: AutoService
  ) {
    // this.getData();
  }

  ngOnInit(): void {
    // 设置默认路由
    // 路由跳转
    this.router.navigate(['search', 'home'], {
      // queryParams: {
      //   key: 'recommend',
      // },
    });

    this.search$.pipe(debounceTime(500)).subscribe(value => {
      // API
      var params = {key:value};
    // console.log(params);
    
      const promise = this.autoserver.autoComplate(params);
      promise
        .then((result) => {
          //换成数组
          let arr = [];  
          if(result['result'][0] instanceof Object){
            arr.push(result['result'][0]['displaySymbol'] + ' | '+ result['result'][0]['description'],
            result['result'][1]['displaySymbol'] + ' | '+ result['result'][1]['description'],
            result['result'][2]['displaySymbol'] + ' | '+ result['result'][2]['description'],
            result['result'][3]['displaySymbol'] + ' | '+ result['result'][3]['description'],
            result['result'][4]['displaySymbol'] + ' | '+ result['result'][4]['description'],
            );
          }
      
          this.options = arr;

          // 自动补全
          this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
          );
        })
        .catch((err) => {
          // console.log(err);
          throw err;
        });
    })
  }
  

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    // console.log(this.options);
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  // 获取图片数据
  async getData(): Promise<void> {
    const result = await this.server.getImageData();
    this.quoteList = result.data.items;
    this.quoteList = this.quoteList.slice(0, 9);
  }

  // 切换指数
  toggleZhishu(index: number): void {
    // console.log(index);
    this.circleActive = index;
    this.zhishuListPosition = `translate(-${index * 640}px)`;
  }

  // tab
  tabClick(index: number): void {
    // console.log(index);

    const pathList = ['recommend', 'liveNews', 'hushen', 'kechaung'];
    // 路由跳转
    this.router.navigate(['search', pathList[index]], {
      queryParams: {
        key: pathList[index],
      },
    });
    // 改变页签
    this.tabActiveIndex = index;
  }

  //search
  searchClick(searchword: string): void{
    let searchwordone = searchword.split('|',1);
    const reg = /\s+$/g;
    searchwordone[0] =  searchwordone[0].replace(reg,'');
    this.router.navigate(['search', searchwordone[0]]);
  }


  onSearch(value: string) {
     this.search$.next(value);
  }


  //自动完成
  autoC(searchword: string){
    
    var params = {key:searchword};
    // console.log(params);
    
      const promise = this.autoserver.autoComplate(params);
      promise
        .then((result) => {
          //换成数组
          let arr = [];  
          if(result['result'][0] instanceof Object){
            arr.push(result['result'][0]['displaySymbol'] + ' | '+ result['result'][0]['description'],
            result['result'][1]['displaySymbol'] + ' | '+ result['result'][1]['description'],
            result['result'][2]['displaySymbol'] + ' | '+ result['result'][2]['description'],
            result['result'][3]['displaySymbol'] + ' | '+ result['result'][3]['description'],
            result['result'][4]['displaySymbol'] + ' | '+ result['result'][4]['description'],
            );
          }
      
          this.options = arr;

          // 自动补全
          this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
          );
        })
        .catch((err) => {
          // console.log(err);
          throw err;
        });

  }
}
