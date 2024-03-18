import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './views/index/index.component';
import { NewstockComponent } from './views/newstock/newstock.component';
import { NotfoundComponent } from './views/notfound/notfound.component';

import { DayinfoComponent } from './component/dayinfo/dayinfo.component';
import { RecommendComponent } from './component/recommend/recommend.component';
import { AdpageComponent } from './views/adpage/adpage.component';
import { MapsComponent } from './views/maps/maps.component';
import { AutoComponent } from './component/auto/auto.component';
import { WatchlistComponent } from './component/watchlist/watchlist.component';
import { ProtfolioComponent } from './component/protfolio/protfolio.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full',
  },
  {
    path: 'search',
    component: IndexComponent,
    children: [
      {
        path: ':ticker',
        component: RecommendComponent,
      },
      {
        path: 'home',
        component: RecommendComponent,
      },
      {
        path: 'autoc',
        component: AutoComponent,
      },
      
      {
        path: 'liveNews',
        component: DayinfoComponent,
      },
      {
        path: 'hushen',
        component: RecommendComponent,
      },
      {
        path: 'kechaung',
        component: RecommendComponent,
      },
    ],
  },
  {
    path: 'watchlist',
    component: WatchlistComponent,
  },
  {
    path: 'protfolio',
    component: ProtfolioComponent,
  },
  {
    path: 'newStock',
    component: NewstockComponent,
  },
  {
    path: 'advertisement',
    component: AdpageComponent,
  },
  {
    path: 'maps',
    component: MapsComponent,
  },

  // 404
  {
    path: '**',
    component: IndexComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
