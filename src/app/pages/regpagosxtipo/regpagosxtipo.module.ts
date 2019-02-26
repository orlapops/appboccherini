import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RegPagosxtipoPage } from './regpagosxtipo.page';


const routes: Routes = [
  {
    path: '',
    component: RegPagosxtipoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [RegPagosxtipoPage]
})
export class RegPagosxtipoPageModule {}
