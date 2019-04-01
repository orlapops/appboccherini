import { Component, OnInit } from "@angular/core";
import { NavController, ToastController } from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../providers/cliente.service";
import { VisitasProvider } from "../../providers/visitas/visitas.service";
import { RecibosService } from "../../providers/recibos/recibos.service";
import { ParEmpreService } from "../../providers/par-empre.service";

@Component({
  selector: "app-regpagosxtiporeg",
  templateUrl: "./regpagosxtipo.page.html",
  styleUrls: ["./regpagosxtipo.page.scss"]
})
export class RegPagosxtipoPage implements OnInit {
  lfecha = new Date().toISOString();
  regpago = {
    tipopago: "EFE",
    banco: "",
    cta_banco: "",
    fecha: this.lfecha,
    referencia: "",
    nota: "",
    valor: 0
  };
  idregpago: any = this.route.snapshot.paramMap.get("id");
  tipocrud = "A";
  actividadAct: any;
  bancos: any;
  cargobancos = false;
  registro: any;
  constructor(
    public _parEmpre: ParEmpreService,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public _recibo: RecibosService,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public _visitas: VisitasProvider,
    public router: Router
  ) {
    //cargar bancos de firebase
    this._parEmpre.getbancosFB().subscribe((datos: any) => {
      console.log("Cargo en bancos  de firebase datos", datos);
      this.bancos = datos;
      this.cargobancos = true;
    });

    console.log("repagosxtiporeg idregpago:", this.idregpago);
    if (this.idregpago === "0") {
      this.tipocrud = "A";
    } else {
      this.tipocrud = "E";
      this._recibo
        .getitemformpago(this.idregpago)
        .then(resultado => {
          console.log("repagosxtiporeg resultado :", resultado);
          this.regpago = resultado;
        })
        .catch(error => alert(JSON.stringify(error)));
      console.log("repagosxtiporeg editar regtraido:", this.regpago);
      // this._actividad.getIdRegActividad(this.idregpago).subscribe((datos:any) =>{
      //     console.log('Editar datos actividad ', datos);
      //     if (datos){
      //     this.cod_tipoact = datos.tipo_act;
      //     this.nom_tipoact = datos.nom_tipoact;
      //     this.notaAct = datos.notas;
      //     this.registro = datos.registro;
      //     }
      // });
    }
    //cargar pagosxtiporeg de firebase
    // this._actividad.gettiposactFB().subscribe((datos: any) =>{
    //   console.log('Cargo en regpagosxtiporeg los tipo de act de firebase datos', datos);
    //   this.tipos_act = datos;
    // });
    console.log("_visitas ", this._visitas);
    console.log("_cliente ", this._cliente);
  }

  ngOnInit() {}
  changeFormapago(e) {
    console.log("changeFormapago e: ", e);
    console.log("e.detail.value", e.detail.value);
    //  console.log('tipoact:', this.cod_tipoact);
    //  this.nom_tipoact = e.detail.text;
  }

  async addFormapago(item) {
    //validar campos minimos
    let validado = false;
    console.log("validando ", this.regpago);
    if (this.regpago.tipopago === "PBCS" || this.regpago.tipopago === "PBTR") {
      console.log("validando 1");
      if (this.regpago.cta_banco === "") {
        console.log("No lleno el ctabanco");
      } else {
        console.log("lleno la ctabanco");
      }

      if (this.regpago.cta_banco === "" || this.regpago.referencia === "") {
        console.log("validando 3");
        validado = false;
      } else {
        console.log("validando 3");
        validado = true;
      }
    } else {
      if (
        this.regpago.tipopago === "CHD" &&
        (this.regpago.banco === "" || this.regpago.referencia === "")
      ) {
        console.log("validando 4");
        validado = false;
      } else {
        console.log("validando 5");
        validado = true;
      }
    }
    if (validado && this.regpago.valor > 0) {
      console.log("validando 5.1");
      validado = true;
    } else {
      validado = false;
    }
    if (validado) {
      console.log("validando 6", this.regpago);
      this._recibo.addFormapago(this.regpago).then(async property => {
        console.log('adiciono ', this._recibo.formpago);
        const toast = await this.toastCtrl.create({
          showCloseButton: true,
          message: "Item adicionado a forma de pago  del recibo.",
          color: "success",
          duration: 2000,
          position: "bottom"
        });
        toast.present();
        // this.regpago.valor = 0;
        // this.regpago.referencia = "";
      });
    } else {
      console.log("validando 7");
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message:
          "Error debe completar campos. Verifique banco, referencia, valor",
        duration: 2000,
        color: "danger",
        position: "top"
      });
      toast.present();
    }
  }

  async  modificarFormapago() {
    const fh = new Date();
    //validar campos minimos
    let validado = false;
    console.log("validando ", this.regpago);
    if (this.regpago.tipopago === "PBCS" || this.regpago.tipopago === "PBTR") {
      console.log("validando 1");
      if (this.regpago.cta_banco === "") {
        console.log("No lleno el ctabanco");
      } else {
        console.log("lleno la ctabanco");
      }

      if (this.regpago.cta_banco === "" || this.regpago.referencia === "") {
        console.log("validando 3");
        validado = false;
      } else {
        console.log("validando 3");
        validado = true;
      }
    } else {
      if (
        this.regpago.tipopago === "CHD" &&
        (this.regpago.banco === "" || this.regpago.referencia === "")
      ) {
        console.log("validando 4");
        validado = false;
      } else {
        console.log("validando 5");
        validado = true;
      }
    }
    if (validado && this.regpago.valor > 0) {
      console.log("validando 5.1");
      validado = true;
    } else {
      validado = false;
    }
    if (validado) {
      this._recibo
        .modificarFormapago(this.idregpago, this.regpago)
        .then(async result => {
          if (result) {
            const toast = await this.toastCtrl.create({
              showCloseButton: true,
              message: "Modificada forma de pago  del recibo.",
              color: "success",
              duration: 2000,
              position: "bottom"
            });
            toast.present();
          }
        });
    } else {
      console.log("validando 7");
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message:
          "Error debe completar campos. Verifique banco, referencia, valor",
          color: "danger",
          duration: 2000,
        position: "top"
      });
      toast.present();
    }
  }
  eliminarFormapago() {
    this._recibo
      .borraritemformpago(this.idregpago)
      .then(async result => {
        if (result) {
          const toast = await this.toastCtrl.create({
            showCloseButton: true,
            message: "Se elimino forma de pago  del recibo.",
            duration: 2000,
            position: "bottom"
          });
          toast.present();
          this.tipocrud = "A";
          this.regpago.valor = 0;
        }
      });
  }
  changeBanco(e) {
    console.log("changeBanco e: ", e);
    console.log("e.detail.value", e.detail.value);
  }
}
