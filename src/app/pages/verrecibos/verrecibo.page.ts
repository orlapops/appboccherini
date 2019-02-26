import { Component, OnInit } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../providers/cliente.service";
import { VisitasProvider } from "../../providers/visitas/visitas.service";
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { RecibosService } from '../../providers/recibos/recibos.service';

@Component({
  selector: "app-verrecibo",
  templateUrl: "./verrecibo.page.html",
  styleUrls: ["./verrecibo.page.scss"]
})
export class VerreciboPage implements OnInit {
  txtRec = '';
  txtRecImp = '';
  idact: any = this.route.snapshot.paramMap.get("id");
  tipocrud =  'A';
  RecAct: any;
  registro: any;
  cargorec = false;
  constructor(
    public navCtrl: NavController,
    public btCtrl: BluetoothSerial,
    public alertCtrl: AlertController,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public _visitas: VisitasProvider,
    public _recibos: RecibosService,
    public router: Router
  ) {
    console.log('reVerrecibo idact:', this.idact);
    if (this.idact==='0') {
      this.tipocrud = 'A';
    } else {
      this.tipocrud = 'E';
      this._recibos.getIdRegRecibo(this.idact).subscribe((datos:any) =>{
          console.log(' datos recibo ', datos);
          if (datos){
          this.txtRec = datos.txt_imp;
          this.txtRecImp = datos.txt_imp;
          this.RecAct = datos;
          this.cargorec = true;
          }
      });
    }
    //cargar Verrecibo de firebase
  }
  ngOnInit() {
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
              console.log('Confirm Cancelar');
            }
          }, {     

            text: 'Ok',
            handler: (inpu) => {
              printer = inpu;
              console.log(inpu);
              console.log('a imprimir: ', this.txtRecImp);
              const printing = this.btCtrl.connect(printer.id).subscribe(data => {
                this.btCtrl.connect(printer.id);
                this.btCtrl.write(this.txtRecImp).then(async msg => {
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
