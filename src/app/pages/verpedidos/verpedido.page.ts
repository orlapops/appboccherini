import { Component, OnInit } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../providers/cliente.service";
import { VisitasProvider } from "../../providers/visitas/visitas.service";
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ProdsService } from '../../providers/prods/prods.service';

@Component({
  selector: "app-verpedido",
  templateUrl: "./verpedido.page.html",
  styleUrls: ["./verpedido.page.scss"]
})
export class VerpedidoPage implements OnInit {
  txtPed = '';
  txtPedImp = '';
  idact: any = this.route.snapshot.paramMap.get("id");
  tipocrud =  'A';
  PedAct: any;
  registro: any;
  cargoped = false;
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
    console.log('reVerpedido idact:', this.idact);
    if (this.idact==='0') {
      this.tipocrud = 'A';
    } else {
      this.tipocrud = 'E';
      this._prods.getIdRegPedido(this.idact).subscribe((datos:any) =>{
          console.log(' datos pedido ', datos);
          if (datos){
          this.txtPed = datos.txt_imp;
          this.txtPedImp = datos.txt_imp;
          this.PedAct = datos;
          this.cargoped = true;
          }
      });
    }
    //cargar Verpedido de firebase
  }
  ngOnInit() {
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
              console.log('Confirm Cancelar');
            }
          }, {     

            text: 'Ok',
            handler: (inpu) => {
              printer = inpu;
              console.log(inpu);
              console.log('a imprimir: ', this.txtPedImp);
              const printing = this.btCtrl.connect(printer.id).subscribe(data => {
                this.btCtrl.connect(printer.id);
                this.btCtrl.write(this.txtPedImp).then(async msg => {
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
