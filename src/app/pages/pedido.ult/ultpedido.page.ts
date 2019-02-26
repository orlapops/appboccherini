import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
// import { ProdsService } from 'src/app/providers/prods/prods.service';
import { ProdsService } from '../../providers/prods/prods.service';
// import { ClienteProvider } from 'src/app/providers/cliente.service';
import { ClienteProvider } from '../../providers/cliente.service';

@Component({
  selector: 'app-ultpedido',
  templateUrl: './ultpedido.page.html',
  styleUrls: ['./ultpedido.page.scss'],
})

export class UltPedidoPage implements OnInit {
  pedidos: Array<any> = [];
  cargo_pedidos = false;
  error_cargapedidos = false;

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
      this._prods.getUltPedidosClienteDirActual()
        .subscribe((datosv: any)  => {
          console.log('ngOnInit getUltPedidosClienteDirActual datosv:', datosv);
          if ( datosv.length > 0) {
                let itemdato = datosv[0];
                this.cargo_pedidos = true;
                this.error_cargapedidos = false;
            //    this.visitaTodas = datosv;
                this.pedidos = [];
                datosv.forEach((visiData: any) => {
                  this.pedidos.push({
                    id: visiData.payload.doc.id,
                    data: visiData.payload.doc.data()
                  });
                });
                console.log('Todos los pedidos dir act', this.pedidos);
            } else {
              this.cargo_pedidos = false;
              this.error_cargapedidos = false;
              this.pedidos = [];
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


