import { Component, OnInit } from "@angular/core";
import { NavController, ToastController } from "@ionic/angular";
import { TranslateProvider } from "../../providers";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../providers/cliente.service";
import { RecibosService } from "../../providers/recibos/recibos.service";
import { DomSanitizer } from '@angular/platform-browser';
import { ParEmpreService } from '../../providers/par-empre.service';

@Component({
  selector: "app-recibo-detail",
  templateUrl: "./recibo-detail.page.html",
  styleUrls: ["./recibo-detail.page.scss"]
})
export class ReciboDetailPage implements OnInit {
  oblshop: any;
  num_obliga: any = this.route.snapshot.paramMap.get("id");
  valor_abono = 0;
  dcto_dchef = 0;
  dcto_dchban = 0;
  dcto_otref = 0;
  dcto_otrban = 0;
  otros_desc = 0;
  retencion = 0;
  paga_efectivo = false;
  fecha_base = new Date().toISOString();
  abono_total = true;
  apli_desc = false;
  total_t: number;
  oblenRecibo: any;
  constructor(
    public _parEmpre: ParEmpreService,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    private translate: TranslateProvider,
    public _recibo: RecibosService,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    private sanitizer: DomSanitizer,
    public router: Router
  ) {
    _recibo.inicializaRecibos();
  }

  ngOnInit() {
    console.log("ngonit recibo detalle num_obliga", this.num_obliga);
    this.oblshop = this._recibo.getOblCartera(this.num_obliga);
    console.log("ngonit recibo detalle ", this.oblshop);
    //traer el registro si esta en lista de lo que se va a recibir
    this.oblenRecibo = this._recibo.getitemRecibo(this.num_obliga);
    //verficiar si tiene derecho a descuento
    const now = new Date();
    this.fecha_base = new Date().toISOString();
    const fechaobli = new Date(this.oblshop.fecha_obl);
    const fechabase = new Date(this.fecha_base);
    const diasdifechas = this._parEmpre.diferenciaEntreDiasEnDias(fechaobli, fechabase);
    console.log('Diferencia entre fechas:', diasdifechas, this.fecha_base,fechabase,fechaobli, this.oblshop.dias_desc);
    if (diasdifechas <= this.oblshop.dias_desc) {
      this.apli_desc = true;
    }

    console.log('ngonit oblshop,oblenrecibo:',this.oblshop, this.oblenRecibo)
    if (this.oblenRecibo) {
      console.log('encontro en recibo');
      if (this.oblenRecibo.abono === 0){
        this.valor_abono = this.oblenRecibo.saldo;
        if (this.apli_desc) {
          if ( this.paga_efectivo) {
// *            this.dcto_dchef = Math.round(this.oblshop.tot_duchas * this.oblshop.pord_duefec / 100)/100;
            this.dcto_dchef = this.oblshop.tot_duchas * this.oblshop.pord_duefec / 100;
            // this.dcto_dchef = Math.round(this.dcto_dchef * 100)/100;
// Redondeo sin decimales
            this.dcto_dchef = Math.round(this.dcto_dchef);
            this.dcto_dchban = 0;
            this.dcto_otref = this.oblshop.tot_otros * this.oblshop.pord_otrefe / 100;
            this.dcto_otref = Math.round(this.dcto_otref);
            this.dcto_otrban = 0;
          } else {
            // this.dcto_dchban = Math.round(this.oblshop.tot_duchas * this.oblshop.pord_duban / 100)/100;
            this.dcto_dchban = this.oblshop.tot_duchas * this.oblshop.pord_duban / 100;
            this.dcto_dchban = Math.round(this.dcto_dchban);
            this.dcto_dchef = 0;
            // this.dcto_otrban = Math.round(this.oblshop.tot_otros * this.oblshop.pord_otrban / 100)/100;
            this.dcto_otrban = this.oblshop.tot_otros * this.oblshop.pord_otrban / 100;
            this.dcto_otrban = Math.round(this.dcto_otrban);
            this.dcto_otref = 0;
          }
        }
        this.otros_desc = 0;
        this.retencion = 0;
      } else {
        this.paga_efectivo = this.oblenRecibo.paga_efectivo;
        this.valor_abono = this.oblenRecibo.abono;
        this.dcto_dchban = this.oblenRecibo.dcto_dchban;
        this.dcto_dchef = this.oblenRecibo.dcto_dchef;
        this.dcto_otrban = this.oblenRecibo.dcto_otrban;
        this.dcto_otref = this.oblenRecibo.dcto_otref;
        this.otros_desc = this.oblenRecibo.otros_desc;
        this.retencion = this.oblenRecibo.retencion;
      }
      this.total_t = this.oblenRecibo.saldo;
    } else {
      this.valor_abono =   this.oblshop.saldo;
      if (this.apli_desc) {
        if ( this.paga_efectivo) {
          this.dcto_dchef = this.oblshop.tot_duchas * this.oblshop.pord_duefec / 100;
          this.dcto_dchef = Math.round(this.dcto_dchef);
          this.dcto_dchban = 0;
          this.dcto_otref = this.oblshop.tot_otros * this.oblshop.pord_otrefe / 100;
          this.dcto_otref = Math.round(this.dcto_otref);
          this.dcto_otrban = 0;
        } else {
          this.dcto_dchban = this.oblshop.tot_duchas * this.oblshop.pord_duban / 100;
          this.dcto_dchban = Math.round(this.dcto_dchban);
          this.dcto_dchef = 0;
          this.dcto_otrban = this.oblshop.tot_otros * this.oblshop.pord_otrban / 100;
          this.dcto_otrban = Math.round(this.dcto_otrban);
          this.dcto_otref = 0;
        }
      }
      console.log('this.dcto_dchban',this.dcto_dchban);
      console.log('this.dcto_otrban',this.dcto_otrban);
      this.otros_desc = 0;
      this.retencion = 0;
      // this.total_t = this.oblshop.saldo;
  }
  }

  checkout(oblshopID: number, obligID: number) {
    this.navCtrl.navigateForward(`recibo-checkout/${oblshopID}/${obligID}`);
  }

  total() {
    this.total_t = 0;
    const fechaobli = new Date(this.oblshop.fecha_obl);
    if (this.paga_efectivo) {
      //si paga efectivo la fecha base es hoy
      this.fecha_base = new Date().toISOString();
    }
    const fechabase = new Date(this.fecha_base);
    console.log('fecha_base',this.fecha_base,fechabase);
    console.log('fechaobli',fechaobli);
    const diasdifechas = this._parEmpre.diferenciaEntreDiasEnDias(fechaobli, fechabase);
    console.log('Diferencia entre fechas:', diasdifechas, this.fecha_base,fechabase,fechaobli, this.oblshop.dias_desc);
    if (diasdifechas <= this.oblshop.dias_desc) {
      this.apli_desc = true;
    } else {
      this.apli_desc = false;
    }
    console.log(this.apli_desc,this.abono_total,this.paga_efectivo);
    if (this.abono_total) {
      this.valor_abono = this.oblshop.saldo;
      if (this.apli_desc) {
        if ( this.paga_efectivo) {
          this.dcto_dchef = this.oblshop.tot_duchas * this.oblshop.pord_duefec / 100;
          this.dcto_dchef = Math.round(this.dcto_dchef);
          this.dcto_dchban = 0;
          this.dcto_otref = this.oblshop.tot_otros * this.oblshop.pord_otrefe / 100;
          this.dcto_otref = Math.round(this.dcto_otref);
          this.dcto_otrban = 0;
        } else {
          this.dcto_dchef = 0;
          // this.dcto_dchban = Math.round(this.oblshop.tot_duchas * this.oblshop.pord_duban / 100)/100;
          this.dcto_dchban = this.oblshop.tot_duchas * this.oblshop.pord_duban / 100;
          console.log('this.dcto_dchban',this.dcto_dchban);
          this.dcto_dchban = Math.round(this.dcto_dchban);
          console.log('this.dcto_dchban',this.dcto_dchban);
          this.dcto_dchef = 0;
          // this.dcto_otrban = Math.round(this.oblshop.tot_otros * this.oblshop.pord_otrban / 100)/100;
          this.dcto_otrban = this.oblshop.tot_otros * this.oblshop.pord_otrban / 100;
          console.log('this.dcto_otrban',this.dcto_otrban);
          this.dcto_otrban = Math.round(this.dcto_otrban);
          console.log('this.dcto_otrban',this.dcto_otrban);
          this.dcto_otref = 0;
        }
      }
      } else {
        this.dcto_dchban = 0;
        this.dcto_otrban = 0;
        this.dcto_dchef = 0;
        this.dcto_otref = 0;
      }
    this.total_t = this.valor_abono;
    return this.total_t;
  }

  async addrecibo(item) {
    this._recibo.addrecibocaja(item, this.paga_efectivo, this.valor_abono, this.dcto_dchban,
      this.dcto_otrban, this.dcto_dchef, this.dcto_otref,
      this.otros_desc, this.retencion).then(async property => {
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message: "Item adicionado a el recibo.",
        duration: 2000,
        position: "bottom"
      });

      toast.present();
    });
  }
    async deleterecibo(item) {
      this._recibo.borraritemrecibo(item)
      .then(async property => {
        const toast = await this.toastCtrl.create({
          showCloseButton: true,
          message: "Item Eliminado a el recibo.",
          duration: 2000,
          position: "bottom"
        });  
        toast.present();
      });
    }
      cleanURL(oldURL: string) {
        return this.sanitizer.bypassSecurityTrustUrl(oldURL);
      }  
  }
