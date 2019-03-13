import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { ParEmpreService } from '../../providers/par-empre.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ConsignacionesService } from '../../providers/consignaciones/consignaciones.service';

@Component({
  selector: 'app-consignacion',
  templateUrl: './consignar.page.html',
  styleUrls: ['./consignar.page.scss'],
})
export class ConsignarPage implements OnInit {
  formpagefec: Array<any> = [];
  formpagcheq: Array<any> = [];
  consignadas: Array<any> = [];
  formaspago: Array<any> = [];
  cargoformpago = false;
  totefectivo = 0;
  totalcheques = 0;
  totalconsignadas = 0;
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
    ajuste: 0
  };

  pag_fechach1 =   new Date().toISOString();
  pag_fechach2 =   new Date().toISOString();

  grabando_consigna = false;
  grabo_consigna = false;
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
    public _consigna: ConsignacionesService,
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
    this.getFormPagodia();
    // this.totalpago();
    console.log('for pagos: ');
  }

  getFormPagodia() {
    this.formaspago = [];
    return new Promise((resolve, reject) => {
      this._consigna.getFormPagodia()
      .subscribe((datos: any) =>{
        this.formaspago = datos;
        this.cargoformpago = true;
        for (let item of this.formaspago) {
          if (item.formpago === "EFE" || item.formpago === "CHD") {
            if (item.consignado){
              this.totalconsignadas += item.valor;
              this.consignadas.push(item);
            } else {
              if (item.formpago === 'EFE') {
                this.totefectivo += item.valor;
                this.formpagefec.push(item);
              } else {
                this.totalcheques += item.valor;
                this.formpagcheq.push(item);
              }
            }            
          } 
        }
        this.regconsig.valor = this.totefectivo + this.totalcheques;
        console.log('Datos de formas de pago del dia leidas', datos);
        console.log('Datos Efectivo',this.totefectivo, this.formpagefec);
        console.log('Datos cheques',this.totalcheques, this.formpagcheq);
        console.log('Datos Consignadas',this.totalconsignadas, this.consignadas);
        return resolve(true);
      });
    });
  }



  realizar_consigna(){
    this.grabando_consigna = true;
    const obj_graba = {
      cta_banco: this.regconsig.cta_banco,
      fecha: this.regconsig.fecha,
      referencia: this.regconsig.referencia,
      nota: this.regconsig.nota,
      valor: this.regconsig.valor,
      ajuste: this.regconsig.ajuste,
      efectivo: this.formpagefec,
      cheques: this.formpagcheq
    };
  
    this._consigna.genera_consigna_netsolin(obj_graba)
    .then(res => {
      if (res){
        this.mostrandoresulado = true;
        this.grabo_consigna = true;
        console.log('retorna genera_consigna_netsolin res:', res);
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
    
  }
  quitar_resuladograboconsigna(){
    if (this.grabo_consigna){
      this.grabo_consigna = false;
    }
    this.grabando_consigna = false;
    this.mostrandoresulado = false;    
  }

  imprimir_consigna() {
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
    console.log("changeBanco e: ", e);
    console.log("e.detail.value", e.detail.value);
  }
}

