import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { ParEmpreService } from '../../providers/par-empre.service';
import { RecibosService } from '../../providers/recibos/recibos.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Component({
  selector: 'app-recibocaja',
  templateUrl: './recibocaja.page.html',
  styleUrls: ['./recibocaja.page.scss'],
})

export class RecibocajaPage implements OnInit {
  recibocaja: Array<any> = [];
  formaspago: Array<any> = [];
  total_recibo = 0;
  tdcto_dchban = 0;
  tdcto_dchef = 0;
  tdcto_otrban = 0;
  tdcto_otref = 0;
  totros_desc = 0;
  tretencion = 0;
  tneto_recibir = 0;
  tneto_recibirefe = 0;
  tneto_recibirban = 0;
  pag_efectivo = 0;
  pag_bancos = 0;
  pag_cheq1 = 0;
  pag_cheq2 = 0;
  generar_recibo = false;
  pag_ch1banco = '';
  pag_ch1cuenta = '';
  pag_ch2banco = '';
  pag_ch2cuenta = '';
  pag_numcheq1 = 0;
  pag_numcheq2 = 0;
  pag_fechach1 =   new Date().toISOString();
  pag_fechach2 =   new Date().toISOString();

  grabando_recibo = false;
  grabo_recibo = false;
  mostrandoresulado = false;
  vistapagos: String = 'verobls';
  
  constructor(
    public _parEmpre: ParEmpreService,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public btCtrl: BluetoothSerial,
    private translate: TranslateProvider,
    public _visitas: VisitasProvider,
    public _cliente: ClienteProvider,
    public _recibos: RecibosService,
    public _DomSanitizer: DomSanitizer,
    ) { }

  ngOnInit() {
    this.getRecibocaja();
    // this.totalpago();
    console.log('for pagos: ', this._recibos.formpago);
  }
  deleteItem(item) {
    console.log('antes de borraritemformpago: ', this._recibos.formpago);
    this._recibos.borraritemformpago(item)
      .then(resulta => {
        // this.getRecibocaja();
        this._recibos.actualizar_totalformaspago();
        console.log('retorna de borraritem', resulta, this._recibos.formpago);
      })
      .catch(error => alert(JSON.stringify(error)));
  }
  // getFormapago() {
  //   this._recibos.getFormapago()
  //     .then(data => {
  //       console.log('formapgo data', data);
  //        this.formaspago = data; 
  //        this._recibos.actualizar_totalformaspago();
  //         this.actualizar_totalrecibo();
  //       });
  // }
  getRecibocaja() {
    return new Promise((resolve, reject) => {
      this._recibos.getRecibocaja()
      .then(data => {
        console.log('Recibo data', data);
         this.recibocaja = data; 
         this.totalpago();
        //  this._recibos.actualizar_totalformaspago();
        //   this.actualizar_totalrecibo();
        });
        return resolve(true);
      });
      }
  total(item, i){
    console.log('en total item llega:', i, item, this.recibocaja);
    this.recibocaja[i].item.saldo = this.recibocaja[i].item.saldoini - this.recibocaja[i].item.abono;
    this.actualizar_totalrecibo();
    this._recibos.guardar_storage_recibo();
  }

  totalpago(){
    return new Promise((resolve, reject) => {
    console.log('totalpago 1');
    this.generar_recibo = false;
    this.actualizar_totalrecibo();
    console.log('totalpago 2');
    this._recibos.actualizar_totalformaspago();
    console.log('totalpago 3');
    if ((this.tneto_recibir - this._recibos.totformaspago === 0)
      && (this.tneto_recibirban - this._recibos.totformpagban === 0)
      && (this.tneto_recibirefe - this._recibos.totformpagefec === 0)
      && (this.tneto_recibir > 0)
    ) {
      console.log('totalpago 5');
      this.generar_recibo = true;
    }
    console.log('totalpago 6');
    console.log('En promesa totalpago retur');
    return resolve(true);
  });
  }

  actualizar_totalrecibo(){
    return new Promise((resolve, reject) => {
    this.total_recibo = 0;
    this.tdcto_dchban = 0;
    this.tdcto_dchef = 0;
    this.tdcto_otrban = 0;
    this.tdcto_otref = 0;
    this.totros_desc = 0;
    this.tretencion = 0;
    this.tneto_recibir = 0;
    this.tneto_recibirban = 0;
    this.tneto_recibirefe = 0;
    console.log('actualizar_totalrecibo', this.recibocaja);
    console.log('totale actualizar_totalrecibo', this.tneto_recibirban, this.tneto_recibirefe);

    for( const itemr of this.recibocaja ){
      console.log(itemr);
      this.total_recibo += itemr.item.abono;
      this.tdcto_dchban += itemr.item.dcto_dchban;
      this.tdcto_dchef += itemr.item.dcto_dchef;
      this.tdcto_otrban += itemr.item.dcto_otrban;
      this.tdcto_otref += itemr.item.dcto_otref;
      this.totros_desc += itemr.item.otros_desc;
      this.tretencion += itemr.item.retencion;
      this.tneto_recibir += itemr.item.neto_recibir;
      if (itemr.item.paga_efectivo) {
        this.tneto_recibirefe += itemr.item.neto_recibir;
      } else {
        this.tneto_recibirban += itemr.item.neto_recibir;
      }
      console.log('totale actualizar_totalrecibo 1', this.tneto_recibirban, this.tneto_recibirefe);
      // console.log("SUMA");
      // console.log (this.total_recibo);
    }
    console.log('totale actualizar_totalrecibo 2', this.tneto_recibirban, this.tneto_recibirefe);
    console.log('En promesa actualizar_totalformaspago retur');
    return resolve(true);
  });
  }

  realizar_recibo(){
    this.grabando_recibo = true;
    console.log('a generar recibo ', this.recibocaja,  this._recibos.recibocaja ,  this._recibos.formpago);
    this._recibos.genera_recibo_netsolin(this.total_recibo, this.tdcto_dchban, this.tdcto_otrban, 
      this.tdcto_dchef, this.tdcto_otref, this.totros_desc,
      this.tretencion, this.tneto_recibir, this._recibos.formpago)
      // this.pag_efectivo, this.pag_bancos, this.pag_cheq1, this.pag_ch1banco, this.pag_ch1cuenta, this.pag_numcheq1, this.pag_fechach1,
      //  this.pag_cheq2, this.pag_ch2banco, this.pag_ch2cuenta, this.pag_numcheq2, this.pag_fechach2)
    .then(res => {
      if (res){
        this.mostrandoresulado = true;
        this.grabo_recibo = true;
        this._recibos.borrar_storage_recibo();
        this._recibos.borrar_storage_formpago();
        console.log('retorna genera_pedido_netsolin res:', res);
      } else {
        this.mostrandoresulado = true;
        this.grabo_recibo = false;
        this.grabando_recibo = true;
        console.log('retorna genera_pedido_netsolin error.message: ');  
      }
    })
    .catch(error => {
      this.mostrandoresulado = true;
      this.grabo_recibo = false;
      this.grabando_recibo = true;
      console.log('retorna genera_pedido_netsolin error.message: ', error.message);
    });
  }
  quitar_resuladograborecibo(){
    if (this.grabo_recibo){
      this.recibocaja = [];
      this.grabo_recibo = false;
    }
    this.grabando_recibo = false;
    this.mostrandoresulado = false;    
  }

  imprimir_recibo() {
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
                this.btCtrl.write(this._visitas.visita_activa_copvdet.recibo_grabado.txt_imp).then(async msg => {
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

