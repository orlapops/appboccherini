import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdsService } from '../../providers/prods/prods.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-prod-detail.ped',
  templateUrl: './prod-detail.ped.page.html',
  styleUrls: ['./prod-detail.ped.page.scss'],
})
export class ProdDetailPedPage implements OnInit {
  prodshop: any;
  prodID: any = this.route.snapshot.paramMap.get('id');
  cantidad_sol = 0;
  total_t: number;
  prodenPed: any;

  
  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    private translate: TranslateProvider,
    public prods: ProdsService,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public _DomSanitizer: DomSanitizer,
    public router: Router
  ) { }

  ngOnInit() {
    // this.prodshop = this.prods.getItem(this.prodID);
    this.prodshop = this.prods.getProdPed(this.prodID);
    console.log('ngonit prod detalle ', this.prodshop);
    //traer el registro si esta en lista de lo que se va a facturar
    this.prodenPed = this.prods.getitemPedido(this.prodID);
    if (this.prodenPed){
      this.cantidad_sol = this.prodenPed.cantidad;
      this.total_t = this.prodenPed.total;
    }
  }

  checkout(prodshopID: number, prodID: number) {
    this.navCtrl.navigateForward(`prod-checkout.ped/${prodshopID}/${prodID}`);
  }
  changecantsol(ev: any) {
    // console.log('total ev: ', ev);
    // console.log('total ev.target.value: ', ev.target.value);
    this.total();
    ev.target.value = this.cantidad_sol;
  }

  total(){
    this.total_t = 0;
    if (this.cantidad_sol < 0){
      this.cantidad_sol = 0;
    }
    this.total_t = this.cantidad_sol * this.prodshop.precio_ven;    
    return this.total_t;
  }

  async addpedido(item) {

    this.prods.addpedido(item, this.cantidad_sol)
      .then(async property => {
        const toast = await this.toastCtrl.create({
          showCloseButton: true,
          message: 'Item adicionado a el pedido.',
          duration: 2000,
          position: 'bottom'
        });

        toast.present();
      });
  }
  incrementar_cantidad() {
    this.cantidad_sol = this.cantidad_sol + 1;
    this.total();
  }
  decrementar_cantidad() {
    this.cantidad_sol = this.cantidad_sol - 1;
    this.total();
  }
}
