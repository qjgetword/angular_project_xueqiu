import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
})
export class HeaderComponent implements OnInit {
  constructor( ) {}

  ngOnInit(): void {

  }

  imageConvert(url): string {
    return AppService.imageConvert(url);
  }
}
