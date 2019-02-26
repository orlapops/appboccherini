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
  selector: 'app-factura',
  templateUrl: './factura.page.html',
  styleUrls: ['./factura.page.scss'],
})

export class FacturaPage implements OnInit {
  factura: Array<any> = [];
  total_fact = 0;
  grabando_factura = false;
  grabo_factura = false;
  mostrandoresulado = false;
  itemprodafac: any;
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
    this.getFactura();    
  }

  deleteItem(item) {
    this._prods.borraritemfactura(item)
      .then(() => {
        this.getFactura();
      })
      .catch(error => alert(JSON.stringify(error)));
  }
  getFactura() {
    this._prods.getFactura()
      .then(data => {
        // console.log('getfavoritos data', data);
         this.factura = data; 
         this.actualizar_totalfact();
        });
  }
  total(item, i, ev: any){
    // console.log('en total item llega:', i, item, this.factura);
    this.itemprodafac = this._prods.getProd(this.factura[i].item.cod_ref);
    // console.log('datos item prod a facturar ', this.itemprodafac);
    if (this.factura[i].item.cantidad > this.itemprodafac.existencia)
    {
      this.factura[i].item.cantidad = this.itemprodafac.existencia;
      ev.target.value = this.factura[i].item.cantidad;
    } else {
      if (this.factura[i].item.cantidad < 0)
      {
        this.factura[i].item.cantidad = 0;
        ev.target.value = 0;
        } else {
        this.factura[i].item.total = this.factura[i].item.cantidad * this.factura[i].item.precio;
      }
    }
    this.actualizar_totalfact();
    this._prods.guardar_storage_factura();

    // this.total_t = 0;
    // this.total_t = this.cantidad_sol * this.prodshop.precio_ven;    
    // return this.total_t;
  }  
  actualizar_totalfact(){

    this.total_fact = 0;
    for( let itemf of this.factura ){
      this.total_fact += Number(itemf.item.total)
    ;
      // console.log("SUMA")
      // console.log (this.total_fact)
    }
  }
  realizar_factura(){
    this.grabando_factura = true;
    this._prods.genera_factura_netsolin()
    .then(res => {
      if (res){
        this.mostrandoresulado = true;
        this.grabo_factura = true;
        //Actualizar existencias de referencias restando valores
        this._prods.restaExistenciasprodxfact();
        this._prods.borrar_storage_factura();
        // console.log('retorna genera_factura_netsolin res:', res);
      } else {
        this.mostrandoresulado = true;
        this.grabo_factura = false;
        this.grabando_factura = true;
        // console.log('retorna genera_factura_netsolin error : ', this._visitas.visita_activa_copvdet.resgrb_factu);  
      }
    })
    .catch(error => {
      this.mostrandoresulado = true;
      this.grabo_factura = false;
      this.grabando_factura = true;
      // console.log('retorna genera_factura_netsolin error.message: ', error.message);
    });
  }

  quitar_resuladograbofact(){
    if (this.grabo_factura){
      this.factura = [];
      this.grabo_factura = false;
    }
    this.grabando_factura = false;
    this.mostrandoresulado = false;    
  }

  imprimir_factura() {
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
              console.log('Confirm Cancelar');
            }
          }, {     

            text: 'Ok',
            handler: (inpu) => {
              printer = inpu;
              console.log(inpu);
              console.log('a imprimir: ', this._visitas.visita_activa_copvdet.factura_grabada.txt_imp);
              const printing = this.btCtrl.connect(printer.id).subscribe(data => {
                this.btCtrl.connect(printer.id);
                this.btCtrl.write(this._visitas.visita_activa_copvdet.factura_grabada.txt_imp).then(async msg => {
                // this.btCtrl.write('Probando impresora... \nFunciona :)\n').then(async msg => {
                  const alert2 = await this.alertCtrl.create({
                    message: 'Imprimiendo',
                    buttons: ['Ok']
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


