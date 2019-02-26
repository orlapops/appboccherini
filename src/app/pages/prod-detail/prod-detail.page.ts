import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdsService } from '../../providers/prods/prods.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-prod-detail',
  templateUrl: './prod-detail.page.html',
  styleUrls: ['./prod-detail.page.scss'],
})
export class ProdDetailPage implements OnInit {
  prodshop: any;
  prodID: any = this.route.snapshot.paramMap.get('id');
  cantidad_sol = 0;
  total_t: number;
  prodenFact: any;

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private translate: TranslateProvider,
    public prods: ProdsService,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public _DomSanitizer: DomSanitizer,
    public router: Router
  ) { }

  ngOnInit() {
    // this.prodshop = this.prods.getItem(this.prodID);
    this.prodshop = this.prods.getProd(this.prodID);
    console.log('ngonit prod detalle ', this.prodshop);
    //traer el registro si esta en lista de lo que se va a facturar
    this.prodenFact = this.prods.getitemFactura(this.prodID);
    if (this.prodenFact){
      this.cantidad_sol = this.prodenFact.cantidad;
      this.total_t = this.prodenFact.total;
    }
  }

  checkout(prodshopID: number, prodID: number) {
    this.navCtrl.navigateForward(`prod-checkout/${prodshopID}/${prodID}`);
  }

  incrementar_cantidad() {
    this.cantidad_sol = this.cantidad_sol + 1;
    this.total();
  }
  decrementar_cantidad() {
    this.cantidad_sol = this.cantidad_sol - 1;
    this.total();
  }
  changecantsol(ev: any) {
    // console.log('total ev: ', ev);
    // console.log('total ev.target.value: ', ev.target.value);
    this.total();
    ev.target.value = this.cantidad_sol;
  }
  total() {
    this.total_t = 0;
    if (this.cantidad_sol > this.prodshop.existencia) {
      this.cantidad_sol = this.prodshop.existencia;
      
      // this.alertCtrl.create({
      //   header:'Error',
      //   subHeader: 'Cantidad Invalida',
      //   message: 'No puede sobrepasar las existencias',
      //   buttons: ['Aceptar']
      // }).then (alert => alert.present());
    } else {
      if (this.cantidad_sol < 0){
        this.cantidad_sol = 0;
      }
    }
    this.total_t = this.cantidad_sol * this.prodshop.precio_ven;    
    return this.total_t;
  }

  async addfactura(item) {

    this.prods.addfactura(item, this.cantidad_sol)
      .then(async property => {
        const toast = await this.toastCtrl.create({
          showCloseButton: true,
          message: 'Item adicionado a la factura.',
          duration: 2000,
          position: 'bottom'
        });

        toast.present();
      });
  }

}
