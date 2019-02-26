import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ProdsService } from '../../providers/prods/prods.service';
import { ParEmpreService } from '../../providers/par-empre.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  lang: any;
  enableNotifications: any;
  paymentMethod: any;
  currency: any;
  enablePromo: any;
  enableHistory: any;
  trabajando = false;

  languages: any = ['English', 'Portuguese', 'French'];
  paymentMethods: any = ['Paypal', 'Credit Card'];
  currencies: any = ['USD', 'BRL', 'EUR'];

  constructor(public navCtrl: NavController,
    public _parEmpre: ParEmpreService,
    public _prods: ProdsService
    ) { }

  ngOnInit() {
  }

  editProfile() {
    this.navCtrl.navigateForward('edit-profile');
  }

  logout() {
    this.navCtrl.navigateRoot('login');
  }
  actciudades() {
    console.log('A actualizar ciudades de Netsolin a Firebase');
    this.trabajando = true;
    console.log('Inicio a trabajar cidudades');
    this._parEmpre.cargaCiudadesNetsolin().then(resultado => {
      if (resultado) {
        console.log('Termino de trabaja cidudades');
        this.trabajando = false;
      }
    });
  }
  actbancos() {
    console.log('A actualizar bancos de Netsolin a Firebase');
    this.trabajando = true;
    console.log('Inicio a trabajar bancos');
    this._parEmpre.cargaBancosNetsolin().then(resultado => {
      if (resultado) {
        console.log('Termino de trabaja bancos');
        this.trabajando = false;
      }
    });
  }
  
  //Actualizar imagenes productos factura
  actimagenesfactura() {
    //Actualizar link imagen solo para que actualice en Netsolin el link se comentarea cuando no
    this.trabajando = true;
    this._prods.actLinkimg().then(cargo => {
      if (cargo) {
        this.trabajando = false;
      }
    });
  }
    //Actualizar imagenes productos pedido
    actimagenespedidos(){
      //Actualizar link imagen solo para que actualice en Netsolin el link se comentarea cuando no
      this.trabajando = true;
      this._prods.actLinkimgPed().then(cargo => {
        if (cargo) {
          this.trabajando = false;
        }
      });
  }
}
