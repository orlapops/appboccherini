import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
// import { ClienteProvider } from 'src/app/providers/cliente.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { RecibosService } from '../../providers/recibos/recibos.service';

@Component({
  selector: 'app-ultrecibo',
  templateUrl: './ultrecibo.page.html',
  styleUrls: ['./ultrecibo.page.scss'],
})

export class UltReciboPage implements OnInit {
  recibos: Array<any> = [];
  cargo_recibos = false;
  error_cargarecibos = false;

  constructor(
    public navCtrl: NavController,
    public btCtrl: BluetoothSerial,
    public alertCtrl: AlertController,
    private translate: TranslateProvider,
    public _cliente: ClienteProvider,
    public _recibos: RecibosService,

    ) { }
  
    ngOnInit() {
      console.log('ngOnInit mensajes 1');
      this._recibos.getUltRecibosClienteDirActual()
        .subscribe((datosv: any)  => {
          console.log('ngOnInit getUltRecibosClienteDirActual datosv:', datosv);
          if ( datosv.length > 0) {
                let itemdato = datosv[0];
                this.cargo_recibos = true;
                this.error_cargarecibos = false;
            //    this.visitaTodas = datosv;
                this.recibos = [];
                datosv.forEach((visiData: any) => {
                  this.recibos.push({
                    id: visiData.payload.doc.id,
                    data: visiData.payload.doc.data()
                  });
                });
                console.log('Todos los recibos dir act', this.recibos);
            } else {
              this.cargo_recibos = false;
              this.error_cargarecibos = false;
              this.recibos = [];
            }
        });

  }

  // total(item, i){
  //   console.log('en total item llega:', i, item, this.pedido);
  //   this.pedido[i].item.total = this.pedido[i].item.cantidad * this.pedido[i].item.precio;
  //   this.actualizar_totalped();
  //   this._prods.guardar_storage_pedido();

  // } 

}


