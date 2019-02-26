import { Component, OnInit } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../providers/cliente.service";
import { VisitasProvider } from "../../providers/visitas/visitas.service";
import { ProdsService } from '../../providers/prods/prods.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Component({
  selector: "app-verfactura",
  templateUrl: "./verfactura.page.html",
  styleUrls: ["./verfactura.page.scss"]
})
export class VerfacturaPage implements OnInit {
  txtFact = '';
  txtFactImp = '';
  idact: any = this.route.snapshot.paramMap.get("id");
  tipocrud =  'A';
  FactAct: any;
  registro: any;
  cargofact = false;
  constructor(
    public navCtrl: NavController,
    public btCtrl: BluetoothSerial,
    public alertCtrl: AlertController,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public _visitas: VisitasProvider,
    public _prods: ProdsService,    
    public router: Router
  ) {
    console.log('reVerfactura idact:', this.idact);
    if (this.idact==='0') {
      this.tipocrud = 'A';
    } else {
      this.tipocrud = 'E';
      this._prods.getIdRegFactura(this.idact).subscribe((datos:any) =>{
          console.log(' datos factura ', datos);
          if (datos){
          this.txtFact = datos.txt_imp;
          this.txtFactImp = datos.txt_imp;
          this.FactAct = datos;
          this.cargofact = true;
          }
      });
    }
    //cargar Verfactura de firebase
  }
  ngOnInit() {
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
              console.log('a imprimir: ', this.txtFactImp);
              const printing = this.btCtrl.connect(printer.id).subscribe(data => {
                this.btCtrl.connect(printer.id);
                this.btCtrl.write(this.txtFactImp).then(async msg => {
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
