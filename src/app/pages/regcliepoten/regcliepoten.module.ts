import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RegCliepotenPage } from './regcliepoten.page';
import { AgmCoreModule } from '@agm/core';


const routes: Routes = [
  {
    path: '',
    component: RegCliepotenPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AgmCoreModule.forRoot({
      // apiKey: 'AIzaSyD9BxeSvt3u--Oj-_GD-qG2nPr1uODrR0Y'
      apiKey: 'AIzaSyBCxuyq-qQPZFoWSc7UYY1uCznmZnjfqGI'
    }),
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [RegCliepotenPage]
})
export class RegCliepotenPageModule {}
