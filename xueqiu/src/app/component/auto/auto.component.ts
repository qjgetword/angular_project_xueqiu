import { Component, OnInit } from '@angular/core';

import { AutoService } from '../../service/auto.service';
import { ActivatedRoute } from '@angular/router';
import {Observable} from 'rxjs';
import {UntypedFormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';



// 接口对应
const tabObj = {
  recommend: -1,
  liveNews: 6,
  hushen: 105,
  kechaung: 115,
};

@Component({
  selector: 'app-auto',
  templateUrl: './auto.component.html',
  styleUrls: ['./auto.component.less']
})
export class AutoComponent implements OnInit {

  hostList = [];

  myControl = new UntypedFormControl('');
  filteredOptions: Observable<string[]>;
  options: string[] = ['One', 'Two', 'Three'];

  constructor(public server: AutoService, public route: ActivatedRoute) {}

  ngOnInit(): void {
    // this.route.queryParams.subscribe((params) => {
    //   // console.log(params);
    //   const promise = this.server.autoComplate(params);
    //   promise
    //     .then((result) => {
    //       //换成数组
    //       let arr = [];  

    //       arr.push(result['result'][0],result['result'][1],result['result'][2],result['result'][3],result['result'][4])
    //       // console.log(arr);

    //       this.hostList = arr;
    //     })
    //     .catch((err) => {
    //       // console.log(err);
    //       throw err;
    //     });
    // });
 
  }

  
}
