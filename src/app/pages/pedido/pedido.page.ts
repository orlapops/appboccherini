import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { ProdsService } from '../../providers/prods/prods.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
})

export class PedidoPage implements OnInit {
  pedido: Array<any> = [];
  total_ped = 0;
  grabando_pedido = false;
  grabo_pedido = false;
  mostrandoresulado = false;
  itemprodaped: any;
  constructor(
    public navCtrl: NavController,
    public btCtrl: BluetoothSerial,
    public alertCtrl: AlertController,
    private translate: TranslateProvider,
    public _prods: ProdsService,
    public route: ActivatedRoute,
    public router: Router,
    public _DomSanitizer: DomSanitizer,
    public _cliente: ClienteProvider,
    public _visitas: VisitasProvider

    ) { }
  ngOnInit() {
    this.getPedido();
  }

  deleteItem(item) {
    this._prods.borraritempedido(item)
      .then(() => {
        this.getPedido();
      })
      .catch(error => alert(JSON.stringify(error)));
  }

  getPedido() {
    this._prods.getPedido()
      .then(data => {
        // console.log('getfavoritos data', data);
         this.pedido = data; 
         this.actualizar_totalped();
        });
  }
  total(item, i, ev: any){
    // console.log('en total item llega:', i, item, this.pedido);
    this.itemprodaped = this._prods.getProdPed(this.pedido[i].item.cod_ref);
    if (this.pedido[i].item.cantidad < 0)
    {
      this.pedido[i].item.cantidad = 0;
      ev.target.value = 0;
    } else {
      this.pedido[i].item.total = this.pedido[i].item.cantidad * this.pedido[i].item.precio;
    }
    this.actualizar_totalped();
    this._prods.guardar_storage_pedido();
    // this.total_t = 0;
    // this.total_t = this.cantidad_sol * this.prodshop.precio_ven;    
    // return this.total_t;
  }  
  actualizar_totalped(){
    this.total_ped = 0;
    for( let itemp of this.pedido ){
      this.total_ped += Number(itemp.item.total)
    ;
      // console.log("SUMA")
      // console.log (this.total_ped)
    }
  }
  realizar_pedido(){
    this.grabando_pedido = true;
    this._prods.genera_pedido_netsolin()
    .then(res => {
      if (res){
        this.mostrandoresulado = true;
        this.grabo_pedido = true;
        //Actualizar existencias de referencias restando valores
        this._prods.restaExistenciasprodxpedido();
        this._prods.borrar_storage_pedido();
        // console.log('retorna genera_pedido_netsolin res:', res);
      } else {
        this.mostrandoresulado = true;
        this.grabo_pedido = false;
        this.grabando_pedido = true;
        // console.log('retorna genera_pedido_netsolin error.message: ');  
      }
    })
    .catch(error => {
      this.mostrandoresulado = true;
      this.grabo_pedido = false;
      this.grabando_pedido = true;
      // console.log('retorna genera_pedido_netsolin error.message: ', error.message);
    });
  }
  quitar_resuladograboped(){
    if (this.grabo_pedido){
      this.pedido = [];
      this.grabo_pedido = false;
    }
    this.grabando_pedido = false;
    this.mostrandoresulado = false;    
  }

  imprimir_pedido() {
    let printer;
    this.btCtrl.list().then(async datalist => {
      let sp = datalist;
      let input =[];
      sp.forEach(element => {
        let val = {name: element.id, type: 'radio', label: element.name, value: element};
        input.push(val);
      });
      const alert = await this.alertCtrl.create({
        header: 'Selecciona impresora',
        inputs: input,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            
            text: 'Ok',
            handler: (inpu) => {
              printer = inpu;
              console.log(inpu);
              const printing = this.btCtrl.connect(printer.id).subscribe(data => {
                this.btCtrl.connect(printer.id);
                this.btCtrl.write(this._visitas.visita_activa_copvdet.pedido_grabado.txt_imp).then(async msg => {
                  const alert2 = await this.alertCtrl.create({
                    message: 'Imprimiendo',
                    buttons: ['Cancel']
                  });
                   await alert2.present();
                }, async err => {
                   const alerter = await this.alertCtrl.create({
                    message: 'ERROR' + err,
                    buttons: ['Cancelar']
                  });
                   await alerter.present();
                });
              });              
            }
          }
        ]
      });
       await alert.present();
    }, async err => {
      console.log('No se pudo conectar', err);
       const alert = await this.alertCtrl.create({
        message: 'ERROR' + err,
        buttons: ['Cancelar']
      });
       await alert.present();
    });

  }
}


