import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AgmCoreModule } from '@agm/core';

import { VisitaListPage } from './visita-list.page';

const routes: Routes = [
  {
    path: '',
    component: VisitaListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    AgmCoreModule.forRoot({
      //Abril 25 2019 habilitada facturacion
      apiKey: 'AIzaSyBSC-DvlUcEskduxwr0LHzjTU_OS4Hea4g'      
    })
  ],
  declarations: [VisitaListPage]
})
export class VisitaListPageModule {}
