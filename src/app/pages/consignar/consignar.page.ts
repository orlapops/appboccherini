import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, ToastController, ModalController, Platform, LoadingController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { ParEmpreService } from '../../providers/par-empre.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ConsignacionesService } from '../../providers/consignaciones/consignaciones.service';
import { ImagePage } from './../modal/image/image.page';
import { ModalActConsigPage } from '../modal/modal-actconsig/modal-actconsig.page';

@Component({
  selector: 'app-consignacion',
  templateUrl: './consignar.page.html',
  styleUrls: ['./consignar.page.scss'],
})
export class ConsignarPage implements OnInit {
  formpagefec: Array<any> = [];
  formpagcheq: Array<any> = [];
  consignadas: Array<any> = [];
  ultconsigna: Array<any> = [];
  formaspago: Array<any> = [];
  cargoformpago = false;
  totefectivo = 0;
  totalcheques = 0;
  bancos: any;
  cargobancos = false;
  cta_banco = '';
  lfecha = new Date().toISOString();
  regconsig = {
    cta_banco: "",
    fecha: this.lfecha,
    referencia: "",
    nota: "",
    valor: 0,
    ajuste: 0,
    cheques: [],
    valcheques: 0
  };

  pag_fechach1 = new Date().toISOString();
  pag_fechach2 = new Date().toISOString();

  grabando_consigna = false;
  grabo_consigna = false;
  mostrandoresulado = false;
  vistapagos: String = 'verefec';

  constructor(
    public _parEmpre: ParEmpreService,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public btCtrl: BluetoothSerial,
    private translate: TranslateProvider,
    public _visitas: VisitasProvider,
    public _cliente: ClienteProvider,
    public _consigna: ConsignacionesService,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public _DomSanitizer: DomSanitizer,
  ) {
    //cargar bancos de firebase
    this._parEmpre.getbancosFB().subscribe((datos: any) => {
      console.log("Cargo en bancos  de firebase datos", datos);
      this.bancos = datos;
      this.cargobancos = true;
    });
  }

  ngOnInit() {
    this.getFormPagodia().then(res => { });
    this.getUltConsignaPersona();
  }

  async actualizarFotoconsigna(idconsig) {
    console.log('a actualizar actualizarFotoconsigna  modal idconsig:', idconsig);
    const modal = await this.modalCtrl.create({
      component: ModalActConsigPage,
      // componentProps: { fromto: fromto, search: this.search }
      componentProps: { idcs: idconsig }
    });
    return await modal.present();
  }


  async presentImage(image: any) {
    const modal = await this.modalCtrl.create({
      component: ImagePage,
      componentProps: { value: image }
    });
    return await modal.present();
  }

  async presentLoading(pmensaje) {
    const loading = await this.loadingCtrl.create({
      message: pmensaje,
      spinner: 'dots',
      duration: 3000
    });
    return await loading.present();
  }

  async presentError(pmensaje) {
    const alert2 = await this.alertCtrl.create({
      header: 'Error',
      message: pmensaje,
      buttons: ['Enterado'],
      cssClass: 'alerterror'
    });
    return await alert2.present();
  }

  getUltConsignaPersona() {
    this.ultconsigna = [];
    return new Promise((resolve, reject) => {
      this._consigna.getUltConsignaPersona()
        .subscribe((datos: any) => {
          datos.forEach((itemcons: any) => {
            this.ultconsigna.push({
              id: itemcons.payload.doc.id,
              data: itemcons.payload.doc.data()
            });
          });
          return resolve(true);
        });
    });
  }
  getFormPagodia() {
    this.formaspago = [];
    return new Promise((resolve, reject) => {
      this._consigna.getFormPagodia()
        .subscribe((datos: any) => {
          console.log(datos);
          this.formpagefec = [];
          this.formpagcheq = [];
          this.formaspago = datos;
          this.cargoformpago = true;
          for (let item of this.formaspago) {
            
            if (item.formpago === 'EFE') {
              this.totefectivo += item.valor;
              this.formpagefec.push(item);
            } else if (item.formpago === "CHD") {
              this.totalcheques += item.valor;
              this.formpagcheq.push(item);
            }
          }
          return resolve(true);
        });
    });
  }
  
  realizar_consigna() {
    if (this._consigna.generando_consigna) {
      console.log('Ya se esta generando un pedido. Espere');
    }
    this.grabando_consigna = true;
    this.consignadas.forEach(consig =>{
      const obj_graba = {
        cta_banco: consig.cta_banco,
        fecha: consig.fecha,
        referencia: consig.referencia,
        nota: consig.nota,
        valor: consig.valor,
        ajuste: consig.ajuste,
        cuentas: consig.cuentas,
        link_imgfb:consig.img
      };
    this._consigna.genera_consigna_netsolin(obj_graba).then(res => 
      {
        if (res) {
          this.mostrandoresulado = true;
          this.grabo_consigna = true;
          console.log('retorna genera_consigna_netsolin res:', res);
          obj_graba.cuentas.forEach(element => {
            let idcuen = element.cod_docume.trim() + element.num_docume.trim() + element.formpago.trim();
            let idcons = this._consigna.consig_grabada.cod_docume.trim()+this._consigna.consig_grabada.num_docume.trim();
            let objact = {
              porcentaje: element.porcentaje,              
              cod_consig: this._consigna.consig_grabada.cod_docume,
              num_dconsig: this._consigna.consig_grabada.num_docume,
              nota: obj_graba.nota,
              fecha: obj_graba.fecha,
              cta_banco: obj_graba.cta_banco,
              referencia: obj_graba.referencia
            };
            let cuenta = element.valor*(100-(element.porcentaje))*0.01;
            let valorRestante={
              valor: cuenta
            };
            this._consigna.actcierre(idcuen,idcons, objact, valorRestante ,element.fecha);
          });
        } else {
          this.mostrandoresulado = true;
          this.grabo_consigna = false;
          this.grabando_consigna = true;
          console.log('retorna genera_consigna_netsolin error.message: ');
        }
      })
      .catch(error => {
        this.mostrandoresulado = true;
        this.grabo_consigna = false;
        this.grabando_consigna = true;
        console.log('retorna genera_consigna_netsolin error.message: ', error.message);
      });
    });
  }
  quitar_resuladograboconsigna() {
    if (this.grabo_consigna) {
      this.grabo_consigna = false;
    }
    this.grabando_consigna = false;
    this.mostrandoresulado = false;
  }

  imprimir_consigna() {
    let printer;
    this.btCtrl.list().then(async datalist => {
      let sp = datalist;
      let input = [];
      sp.forEach(element => {
        let val = { name: element.id, type: 'radio', label: element.name, value: element };
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
                this.btCtrl.write(this._consigna.consig_grabada.txt_imp).then(async msg => {
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
  changeBanco(e) {
    console.log("changeBanco e: ", this.regconsig.cheques);
    console.log("e.detail.value", e.detail.value);
  }
}

