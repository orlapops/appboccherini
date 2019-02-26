import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
// import { ProdsService } from 'src/app/providers/prods/prods.service';
import { ProdsService } from '../../providers/prods/prods.service';
// import { ClienteProvider } from 'src/app/providers/cliente.service';
import { ClienteProvider } from '../../providers/cliente.service';

@Component({
  selector: 'app-ultfactura',
  templateUrl: './ultfactura.page.html',
  styleUrls: ['./ultfactura.page.scss'],
})

export class UltFacturaPage implements OnInit {
  facturas: Array<any> = [];
  cargo_facturas = false;
  error_cargafacturas = false;

  constructor(
    public navCtrl: NavController,
    public btCtrl: BluetoothSerial,
    public alertCtrl: AlertController,
    private translate: TranslateProvider,
    public _cliente: ClienteProvider,
    public _prods: ProdsService

    ) { }
  
    ngOnInit() {
      console.log('ngOnInit mensajes 1');
      this._prods.getUltFacturasClienteDirActual()
        .subscribe((datosv: any)  => {
          console.log('ngOnInit getUltFacturasClienteDirActual datosv:', datosv);
          if ( datosv.length > 0) {
                let itemdato = datosv[0];
                this.cargo_facturas = true;
                this.error_cargafacturas = false;
            //    this.visitaTodas = datosv;
                this.facturas = [];
                datosv.forEach((visiData: any) => {
                  this.facturas.push({
                    id: visiData.payload.doc.id,
                    data: visiData.payload.doc.data()
                  });
                });
                console.log('Todos los facturas dir act', this.facturas);
            } else {
              this.cargo_facturas = false;
              this.error_cargafacturas = false;
              this.facturas = [];
            }
        });

  }

  // total(item, i){
  //   console.log('en total item llega:', i, item, this.factura);
  //   this.factura[i].item.total = this.factura[i].item.cantidad * this.factura[i].item.precio;
  //   this.actualizar_totalped();
  //   this._prods.guardar_storage_factura();

  // } 

}


