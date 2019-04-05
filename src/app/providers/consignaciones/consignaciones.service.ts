import { Component, OnInit } from "@angular/core";
import { NavController, ToastController } from '@ionic/angular';
import { Injectable } from "@angular/core";
import { NetsolinApp } from "../../shared/global";
import { ParEmpreService } from "../par-empre.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorageReference, AngularFireStorage } from '@angular/fire/storage';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from "@angular/common/http";
import { Platform } from "@ionic/angular";
// Plugin storage
import { Storage } from "@ionic/storage";
import { VisitasProvider } from "../visitas/visitas.service";
import { ClienteProvider } from "../cliente.service";

@Injectable({
  providedIn: "root"
})
export class ConsignacionesService implements OnInit {
  formpagoCounter: number = 0;
  formpago: Array<any> = [];
  totformaspago = 0;
  //total formas de pago efectivo: efectivo y cheques al día
  totformpagefec = 0;
  menerrorgraba = "";
  errorgrb_consig = false;
  grb_consig = false;
  resgrb_consig = "";
  consig_grabada: any;
  constructor(
    public _parempre: ParEmpreService,
    public toastCtrl: ToastController,
    private fbDb: AngularFirestore,
    private afStorage: AngularFireStorage,
    private platform: Platform,
    private storage: Storage,
    private http: HttpClient,
    public _visitas: VisitasProvider,
    public _cliente: ClienteProvider
  ) {}
  ngOnInit() {}
  inicializaRecibos() {
    // console.log("cosntructor prod service recibos");
    // this.cartera = this._cliente.clienteActual.cartera;
    // console.log('cartera:', this.cartera);
  }
  public getconsigna(id){
    return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/consignaciones`)
    .doc(id).valueChanges();
}

  genera_consigna_netsolin(obj_graba){
    console.log("dataos para generar consigna:",obj_graba);
    return new Promise((resolve, reject) => {
      let paramgrab = {
        // datos_gen: this._visitas.visita_activa_copvdet,
        objgraba: obj_graba,
        usuario: this._parempre.usuario.cod_usuar
      };
      NetsolinApp.objenvrest.filtro = "";
      NetsolinApp.objenvrest.parametros = paramgrab;
      this.grb_consig = false;
      this.menerrorgraba = "";
      this.errorgrb_consig = false;
      let url =this._parempre.URL_SERVICIOS +"netsolin_servirestgo.csvc?VRCod_obj=APPGENCONSIGNA";
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        console.log(" genera_consigna_netsolin data:", data);
        if (data.error) {
          this.menerrorgraba = data.men_error;
          this.errorgrb_consig = true;
          this.resgrb_consig = "No se grabo por error";
          console.error(" genera_consigna_netsolin ", data.men_error);
         resolve(false);
        } else {
          if (data.isCallbackError) {
            this.errorgrb_consig = true;
            this.resgrb_consig = "No se grabo por error";
            data.messages.forEach(element => {
              this.menerrorgraba += element.menerror+' / ';  
            });            
              console.error(" Error genera_consigna_netsolin ", this.menerrorgraba);
            resolve(false);
          } else {
            this.errorgrb_consig = false;
            this.grb_consig = true;
            this.resgrb_consig = "Se grabo consignación";
            this.consig_grabada = data;
            console.log("Datos traer genera_consigna_netsolin ", data);
            const objconsigfb = {
              cod_docume: data.cod_docume,
              num_docume: data.num_docume,
              fecha: data.fecha,
              cod_usuar: this._parempre.usuario.cod_usuar,
              cta_banco: obj_graba.cta_banco,
              referencia: obj_graba.referencia,
              valor: obj_graba.valor,
              ajuste: obj_graba.ajuste,
              nota: obj_graba.nota,
              efectivo: obj_graba.efectivo,
              cheques: obj_graba.cheques,
              txt_imp: data.txt_imp,
              detalle: data.consigna_grabada
            };
            this.guardarcierrecajaFb(
              this._parempre.usuario.cod_usuar,
              data.cod_docume.trim() + data.num_docume.trim(),
              objconsigfb
            );
            this.guardarconsigFb(
              this._parempre.usuario.cod_usuar,
              data.cod_docume.trim() + data.num_docume.trim(),
              objconsigfb
            )
              .then(res => {
                console.log("Recibo guardada res: ", res);
                resolve(true);
              })
              .catch(err => {
                console.log("Error guardando consigna en Fb", err);
                resolve(false);
              });
            // resolve(true);
          }
        }
        console.log(" genera_consigna_netsolin 4");
      });
    });
  }
  // Actualiza url firestorage en Netsolin, para cuando se traiga sea màs rapido
  guardarconsigFb(person, id, objconsig) {
    console.log("guardarconsigFb cod_tercer:", person);
    console.log("guardarconsigFb id:", id);
    console.log("guardarconsigFb objrecibo:", objconsig);
    return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/consignaciones`)
      .doc(id)
      .set(objconsig);
  }
  //Guardar para el vendedor o usuario datos para cierre, recibo y formas de pago
  guardarcierrecajaFb(person, id, objconsig) {
    console.log("guardarreciboFb cod_tercer:", person);
    console.log("guardarreciboFb id:", id);
    console.log("guardarreciboFb objrecibo:", objconsig);
    //Actualizar
    const now = new Date();
    //extraemos el día mes y año
    const dia = now.getDate();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    const hora = now.getHours();
    const minutos = now.getMinutes();
    // console.log("Actualizar cierre", lruta);
    console.log('1');
    //asegurarse que este creado el año, mes y dia
    this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario`)
      .doc(ano.toString())
      .set({ ano: ano.toString() });
    //asegurarse que este creado el año, mes y dia
    this.fbDb
      .collection(
        `/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses`
      )
      .doc(mes.toString())
      .set({ mes: mes.toString() });
      console.log('2');
      //asegurarse que este creado el año, mes y dia
    this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias`)
      .doc(dia.toString())
      .set({ dia: dia.toString() });
      console.log('3');

    //cierre de caja por cada forma de pago
    let lrutafp = `/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias/${dia}/consignaciones`;
    console.log('a grabar fb',lrutafp,id,objconsig);
    return this.fbDb
      .collection(lrutafp)
      .doc(id)
      .set(objconsig);
  }
  
  public getUltConsignaPersona() {
    // tslint:disable-next-line:max-line-length
    return this.fbDb
      .collection(
        `/personal/${this._parempre.usuario.cod_usuar}/consignaciones`,
        ref =>
          ref
            .orderBy("fecha", "desc")
            .limit(10)
      )
      .snapshotChanges();
    // .where('id_ruta','==',idruta).orderBy('fecha_in')).snapshotChanges();
  }
  public getFormPagodia() {
    console.log("en getFormPagodia");
    const now = new Date();
    //extraemos el día mes y año
    const dia = now.getDate();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    console.log(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias/${dia}/cierrecaja`);
    return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias/${dia}/cierrecaja`)
      .valueChanges();
  }
  public actconsignacion(id,objact) {
    console.log("en getFormPagodia");
    const now = new Date();
    //extraemos el día mes y año
    const dia = now.getDate();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    console.log(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias/${dia}/cierrecaja`);
    return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias/${dia}/cierrecaja`)
      .doc(id)
      .update(objact);
  }

  actualizaFotoConsignafirebase(idconsig,fecha, imageURL): Promise<any> {
    //extraemos el día mes y año
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const ano = fecha.getFullYear();
    const storageRef: AngularFireStorageReference = this.afStorage.ref(`/img_consigna/${this._parempre.usuario.cod_usuar}/consignacion/${idconsig}`);
    return storageRef
      .putString(imageURL, 'base64', {
        contentType: 'image/png',
      })
      .then(() => {
        // this._parempre.reg_log('a actualizar img fb clie 2 then: ' , idclie);
        // console.log('a a ctualizar foto cliente ', idclie);          
        return storageRef.getDownloadURL().subscribe(async (linkref: any) => {
            this.fbDb.collection(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias/${dia}/consignaciones/`)
              .doc(idconsig).update({link_imgfb: linkref});
            this.fbDb.collection(`/personal/${this._parempre.usuario.cod_usuar}/consignaciones/`)
              .doc(idconsig).update({link_imgfb: linkref});
            const toast = await this.toastCtrl.create({
              showCloseButton: true,
              message: 'Se actualizo la foto consignación.',
              duration: 2000,
              position: 'bottom'
            });
            toast.present();
        }); 
    })
    .catch((error) => {
      console.log('Error actualizaFotoConsignafirebase putString img:', error);
    });
  }

}
