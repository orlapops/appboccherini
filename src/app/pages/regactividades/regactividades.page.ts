import { Component, OnInit } from "@angular/core";
import { NavController, ToastController } from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../providers/cliente.service";
import { ActividadesService } from "../../providers/actividades/actividades.service";
import { VisitasProvider } from "../../providers/visitas/visitas.service";

@Component({
  selector: "app-regactividades",
  templateUrl: "./regactividades.page.html",
  styleUrls: ["./regactividades.page.scss"]
})
export class RegActividadesPage implements OnInit {
  tipos_act: any;
  cod_tipoact = 'OTR';
  nom_tipoact = '';
  notaAct = '';
  idact: any = this.route.snapshot.paramMap.get("id");
  tipocrud =  'A';
  actividadAct: any;
  registro: any;
  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public _actividad: ActividadesService,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public _visitas: VisitasProvider,
    public router: Router
  ) {
    console.log('reactividades idact:', this.idact);
    //cargar actividades de firebase
    this._actividad.gettiposactFB().subscribe((datos: any) =>{
      console.log('Cargo en regactividades los tipo de act de firebase datos', datos);
      this.tipos_act = datos;      
      if (this.idact==='0') {
        this.tipocrud = 'A';
      } else {
        this.tipocrud = 'E';
        this._actividad.getIdRegActividad(this.idact).subscribe((datos:any) =>{
            console.log('Editar datos actividad ', datos);
            if (datos){
            this.cod_tipoact = datos.tipo_act;
            this.nom_tipoact = datos.nom_tipoact;
            this.notaAct = datos.notas;
            this.registro = datos.registro;
            }
        });
      }
  
    });
    console.log('_visitas ', this._visitas);
    console.log('_cliente ', this._cliente);
  }

  ngOnInit() {

  }
  changeActividad(e){
     console.log('changeActividad e: ', e);
     console.log('e.detail.value', e.detail.value);
     console.log(this.tipos_act);
     console.log('tipoact:', this.cod_tipoact);
     //buscar en tipos actividdad
     this.nom_tipoact = this.retornanomact(this.cod_tipoact);
     console.log(this.nom_tipoact);
  }
  retornanomact(cod) {
    const rfiltro = this.tipos_act.filter(reg => reg.cod_tipo === cod);
    return rfiltro[0].descrip;
  }
  grabarActividad(){
    const now = new Date();    
    const activigrab = {
      registro: now,
      tipo_act: this.cod_tipoact,
      nom_tipoact: this.nom_tipoact,
      notas: this.notaAct
    }
    console.log('grabarActividad activigrab:', activigrab);
    this._actividad.grabarActividad(activigrab).then(async res => {
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message: 'Se adiciono actividad.',
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
      console.log('Actividad guardada res: ', res);
      console.log('Actividad guardada res id: ', res.id);
  });
    console.log('Datos a grabar actividad: ', this.cod_tipoact, this.notaAct);
  }
  
  modificarActividad(){
    const now = new Date();
    const activigrab = {
      registro: now,
      tipo_act: this.cod_tipoact,
      nom_tipoact: this.nom_tipoact,
      notas: this.notaAct
    }
    console.log('modificarActividad activigrab:', activigrab);
    this._actividad.modificarActividad(this.idact, activigrab).then(async res => {
      console.log('Actividad modificada res: ', res);
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message: 'Se modifo la actividad.',
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
// console.log('Actividad guardada res id: ', res.id);
  });
  }  
}
