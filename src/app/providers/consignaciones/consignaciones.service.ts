import { Component, OnInit, ɵConsole } from "@angular/core";
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
import { File, DirectoryEntry, FileEntry } from "@ionic-native/file/ngx";

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
  generando_consigna = false;
  linkimagen: any;

  constructor(
    public _parempre: ParEmpreService,
    public toastCtrl: ToastController,
    private fbDb: AngularFirestore,
    private afStorage: AngularFireStorage,
    private platform: Platform,
    private storage: Storage,
    private http: HttpClient,
    public _visitas: VisitasProvider,
    public _cliente: ClienteProvider,
    private file: File
  ) { }
  ngOnInit() { }
  inicializaRecibos() {
    // console.log("cosntructor prod service recibos");
    // this.cartera = this._cliente.clienteActual.cartera;
    // console.log('cartera:', this.cartera);
  }
  public getconsigna(id) {
    return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/consignaciones`)
      .doc(id).valueChanges();
  }

  genera_consigna_netsolin(obj_graba, fototomada) {
    if (this.generando_consigna) {
      console.error('Ya se esta generando un recibo');
      return;
    }
    this.generando_consigna = true;
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
      let url = this._parempre.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=APPGENCONSIGNA";
      console.log("porimprimir", NetsolinApp.objenvrest, url);
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        console.log(" genera_consigna_netsolin data:", data);
        if (data.error) {
          this.menerrorgraba = data.men_error;
          this.errorgrb_consig = true;
          this.resgrb_consig = "No se grabo por error";
          console.error(" genera_consigna_netsolin ", data.men_error);
          this.generando_consigna = false;
          resolve(false);
        } else {
          if (data.isCallbackError) {
            this.errorgrb_consig = true;
            this.resgrb_consig = "No se grabo por error";
            data.messages.forEach(element => {
              this.menerrorgraba += element.menerror + ' / ';
            });
            console.error(" Error genera_consigna_netsolin ", this.menerrorgraba);
            this.generando_consigna = false;
            resolve(false);
          } else {
            this.errorgrb_consig = false;
            this.grb_consig = true;
            this.resgrb_consig = "Se grabo consignación";
            this.consig_grabada = data;
            const objconsigfb = {
              cod_docume: data.cod_docume,
              num_docume: data.num_docume,
              fecha: obj_graba.fecha,
              cta_banco: obj_graba.cta_banco,
              referencia: obj_graba.referencia,
              valor: obj_graba.valor,
              ajuste: obj_graba.ajuste,
              nota: obj_graba.nota,
              link_imgfb: obj_graba.link_imgfb,
              cuentas: obj_graba.cuentas,
              txt_imp: data.txt_imp,
              detalle: data.consigna_grabada
            };
            console.log(objconsigfb)
            this.guardarFb(
              data.cod_docume.trim() + data.num_docume.trim(),
              objconsigfb
            ).then(res => {
              if (fototomada) {
                console.log("grabando foto");
                this.actualizaFotoConsignafirebase(data.cod_docume.trim() + data.num_docume.trim(), obj_graba.fecha, fototomada).then(() => {
                  console.log("guardo foto");
                });
              }
              console.log("Recibo guardada res: ", res);
              this.generando_consigna = false;
              resolve(true);
            })
              .catch(err => {
                console.log("Error guardando consigna en Fb", err);
                this.generando_consigna = false;
                resolve(false);
              });
            // resolve(true);
          }
        }
        console.log(" genera_consigna_netsolin 4");
      });
    });
  }

  //Guardar para el vendedor o usuario datos para cierre, recibo y formas de pago
  guardarFb(id, objconsig) {
    const now = new Date(objconsig.fecha);
    const dia = now.getDate();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    console.log('id');
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
    console.log(objconsig);
    console.log(id);
    return this.fbDb
      .collection(lrutafp)
      .doc(id)
      .set(objconsig).then(res => {
        console.log("primero");
        this.fbDb
          .collection(`/personal/${this._parempre.usuario.cod_usuar}/consignaciones`)
          .doc(id)
          .set(objconsig);
      });
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
    return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/ConsignacionesPendientes`, ref => ref.orderBy("valor", "desc"))
      .valueChanges();
  }
  public actcierre(idcuen, idcons, objact,valorRestante,  f) {
    //extraemos el día mes y año
    const now = new Date(f);
    const dia = now.getDate();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias/${dia}/cierrecaja/${idcuen}/consignaciones`)
      .doc(idcons)
      .set(objact).then(mes => {
        if (valorRestante.valor <= 0) {
          console.log(valorRestante.valor);
          this.fbDb
            .collection(`/personal/${this._parempre.usuario.cod_usuar}/ConsignacionesPendientes`)
            .doc(idcuen).delete();
        }
        else {
          this.fbDb
            .collection(`/personal/${this._parempre.usuario.cod_usuar}/ConsignacionesPendientes`)
            .doc(idcuen).update(valorRestante);
        }
      });
  }


  actualizaFotoConsignafirebase(idconsig, fec, imageURL): Promise<any> {
    //extraemos el día mes y año
    console.log(fec);
    const fecha = new Date(fec);
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const ano = fecha.getFullYear();
    const storageRef: AngularFireStorageReference = this.afStorage.ref(`/img_consigna/${this._parempre.usuario.cod_usuar}/${idconsig}`);
    return this.file.resolveLocalFilesystemUrl(imageURL).then((fe: FileEntry) => {
      console.log(fe);
      let { name, nativeURL } = fe;
      let path = nativeURL.substring(0, nativeURL.lastIndexOf("/"));
      console.log(path, "   ", name);
      return this.file.readAsArrayBuffer(path, name);
    }).then(buffer => {
      let imgBlob = new Blob([buffer], {
        type: "image/jpeg"
      });
      return storageRef.put(imgBlob, {
        contentType: 'image/jpeg',
      }).then(() => {
        return storageRef.getDownloadURL().subscribe(async (linkref: any) => {
          console.log(linkref);
          this.fbDb.collection(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias/${dia}/consignaciones/`)
            .doc(idconsig).update({ link_imgfb: linkref });
          this.fbDb.collection(`/personal/${this._parempre.usuario.cod_usuar}/consignaciones/`)
            .doc(idconsig).update({ link_imgfb: linkref });
          const toast = await this.toastCtrl.create({
            showCloseButton: true,
            message: 'Se actualizo la foto consignación.',
            duration: 2000,
            position: 'bottom'
          });
          toast.present();
        });
      }).catch((error) => {
        console.log('Error actualizaimagenConsignacionfirebase putString img:', error);
      });
    }).catch((error) => {
      console.log('Error leyendo archivo:', error);
    });
  }

}
