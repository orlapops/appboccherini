import { Component, OnInit } from "@angular/core";
import { Injectable } from "@angular/core";
import { NetsolinApp } from "../../shared/global";
import { ParEmpreService } from "../par-empre.service";
// import { AngularFirestore } from "@angular/fire/firestore";
import {HttpClient,HttpHeaders,HttpErrorResponse} from "@angular/common/http";
import { Platform } from "@ionic/angular";
// Plugin storage
import { Storage } from "@ionic/storage";
import { VisitasProvider } from "../visitas/visitas.service";
import { AngularFireStorage,  AngularFireStorageReference } from '@angular/fire/storage';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";


@Injectable({
  providedIn: "root"
})
export class ActividadesService implements OnInit {
  private tipos_activ: any;
  cargoActividadesNetsolin = false;

  constructor(
    public _parempre: ParEmpreService,
    private fbDb: AngularFirestore,
    private platform: Platform,
    private storage: Storage,
    private afStorage: AngularFireStorage,
    private http: HttpClient,
    public _visitas: VisitasProvider
  ) {}
  ngOnInit() {
    console.log("ngoniit ActividadesService");
    console.log(this._visitas);
  }
  // Carga Actividades definidas en Netsolin
  cargaActividadesNetsolin() {
    return new Promise((resolve, reject) => {
      console.log('ingreso a cargaActividadesNetsolin');
      if (this.cargoActividadesNetsolin) {
        console.log("resolve true cargoActividadesNetsolin netsolin por ya estar inciada");
        resolve(true);
      }
      NetsolinApp.objenvrest.filtro = '';
      let url =this._parempre.URL_SERVICIOS +"netsolin_servirestgo.csvc?VRCod_obj=APPTIPOSACT";
      console.log('ingreso a cargaActividadesNetsolin url', url, NetsolinApp.objenvrest);
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        if (data){
        console.log('ingreso a cargaActividadesNetsolin data', data);
        if (data.error) {
          console.error(" cargaActividadesNetsolin ", data.error);
          this.cargoActividadesNetsolin = false;
          this.tipos_activ = null;
          resolve(false);
        } else {
          console.log('ingreso a cargaActividadesNetsolin cargo activudades');
          this.cargoActividadesNetsolin = true;
          this.tipos_activ = data.actividades;
          resolve(true);
        }
      } 
      // else {
      //   this.cargoActividadesNetsolin = false;
      //   this.tipos_activ = null;
      //   resolve(false);
      // }
      });
    });
  }
      //Obtiene actividad con id
  public getIdRegActividad(Id: string) {
    console.log('en getIdRegActividad',Id);
    console.log(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/actividades`);
  return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/actividades`)
   .doc(Id).valueChanges();
  }



  //guardar tipos actividades en firebase
  public guardarTiposactFB() {
    return new Promise((resolve, reject) => {
    console.log('guardarTiposactFB:');
    console.log(this.tipos_activ);
    let tiposlist: AngularFirestoreCollection<any>;
    tiposlist = this.fbDb.collection(`tipos_actividades/`);
    this.tipos_activ.forEach((tipact: any) => {
      console.log('recorriendo tipos act :tipact ', tipact);
      let idact   = tipact.cod_tipo;
      console.log('recorriendo direcciones :iddir ', idact);
      let tipo_act = {
        cod_tipo: tipact.cod_tipo,
        descrip: tipact.descrip
      };
      tiposlist.doc(idact).set(tipo_act);
    });   
    resolve(true);
  });
  }


  //Obtiene tipos actividades de FB
  public gettiposactFB() {
    return this.fbDb
      .collection("tipos_actividades")
      .valueChanges();
  }

  public grabarActividad(objact) {
    console.log('obj act a grabar:',objact);
    console.log('en grabar actividad coleccion: ',    
    `/personal/${this._parempre.usuario.cod_usuar}
    /rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/actividades`);
    return this.fbDb
    // tslint:disable-next-line:max-line-length
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/actividades`)
    .add(objact);
  }
  public modificarActividad(id, objact) {
    console.log('en grabar actividad coleccion: ',
    `/personal/${this._parempre.usuario.cod_usuar}
    /rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/actividades`);
    return this.fbDb
    // tslint:disable-next-line:max-line-length
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/actividades`)
    .doc(id).update(objact);
  }
  
 //Obtiene actividades de la visita actual
 public getActividadesVisitaActual(ObjVisitaAct) {
  // tslint:disable-next-line:max-line-length
  console.log('getActividadesVisitaActual:', `/personal/${this._parempre.usuario.cod_usuar}/rutas/${ObjVisitaAct.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${ObjVisitaAct.id_visita}/actividades`);
  return this.fbDb
  // tslint:disable-next-line:max-line-length
  .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${ObjVisitaAct.id_visita}/actividades`)
  .snapshotChanges().pipe(
    map(actions => actions.map(a => {
      const data = a.payload.doc.data();
      const id = a.payload.doc.id;
      return {id, ...data };
    })
      )
  ) 
}      

 //Obtiene actividades de la visita actual
 public getFotosVisitaActual(ObjVisitaAct) {
  // tslint:disable-next-line:max-line-length
  console.log('getFotosVisitaActual:', `/personal/${this._parempre.usuario.cod_usuar}/rutas/${ObjVisitaAct.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${ObjVisitaAct.id_visita}/fotos`);
  return this.fbDb
  // tslint:disable-next-line:max-line-length
  .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${ObjVisitaAct.id_visita}/fotos`)
  .snapshotChanges().pipe(
    map(actions => actions.map(a => {
      const data = a.payload.doc.data();
      const id = a.payload.doc.id;
      return {id, ...data };
    })
      )
  ) 
}    
actualizafotosVisitafirebase(idclie, idvisita, imageURL): Promise<any> {
  const now = new Date();
  const dia = now.getDate();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();
  const hora = now.getHours();
  const minutos = now.getMinutes();
  const segundos = now.getSeconds();
  const milisegundos = now.getMilliseconds();
  console.log(milisegundos);
  const idimg = ano.toString()+ mes.toString() + dia.toString() + hora.toString() + minutos.toString()+ segundos.toString()+milisegundos;
  console.log(idimg);
  const storageRef: AngularFireStorageReference = this.afStorage.ref(`/img_visitas/${idclie}/visita/${idvisita}/${idimg}/`);
  // this._parempre.reg_logappusuario('tomafoto','actualizafotosVisitafirebase ',{storageRef: storageRef});
  console.log('tomafoto','actualizafotosVisitafirebase ',storageRef);
  console.log('en actualizafotosVisitafirebase idclie,iddirec: ', idclie, idvisita);
  return storageRef
    .putString(imageURL, 'base64', {
      contentType: 'image/png',
    })
    .then(() => {
      // this._parempre.reg_logappusuario('tomafoto','actualizafotosVisitafirebase idclie',{idclie: idclie});
      console.log('a a ctualizar foto cliente visita ', idclie);          
      return storageRef.getDownloadURL().subscribe((linkref: any) => {
        // this._parempre.reg_logappusuario('tomafoto','actualizafotosVisitafirebase linkref',{linkref: linkref});
        console.log(linkref);
        // this._parempre.reg_logappusuario('tomafoto','actualizafotosVisitafirebase url guar',{urlfb: `/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${idvisita}/fotos`});
        console.log(`/personal/${this._parempre.usuario.cod_usuar}/rutas/
          ${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${idvisita}/fotos`);
          this.fbDb
          // tslint:disable-next-line:max-line-length
          .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${idvisita}/fotos`)
          .add({link_foto: linkref});
      }); 
  });
}      


}
