import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppService } from './app.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './views/index/index.component';
import { ChooseComponent } from './views/choose/choose.component';
import { NewstockComponent } from './views/newstock/newstock.component';
import { NotfoundComponent } from './views/notfound/notfound.component';
import { DayinfoComponent } from './component/dayinfo/dayinfo.component';
import { RecommendComponent } from './component/recommend/recommend.component';
import { TotimePipe } from './pipe/totime.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from './views/footer/footer.component';
import { HeaderComponent } from './views/header/header.component';
import { AdpageComponent } from './views/adpage/adpage.component';
import { MapsComponent } from './views/maps/maps.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import { AutoComponent } from './component/auto/auto.component';
import { HighchartsChartModule } from 'highcharts-angular';




@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    ChooseComponent,
    NewstockComponent,
    NotfoundComponent,
    DayinfoComponent,
    RecommendComponent,
    TotimePipe,
    FooterComponent,
    HeaderComponent,
    AdpageComponent,
    MapsComponent,
    AutoComponent,
    
  ],
  // import HttpClientModule after BrowserModule.
  imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule, BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    HighchartsChartModule
  ],
  
  providers: [AppService],
  bootstrap: [AppComponent],
})
export class AppModule {}
