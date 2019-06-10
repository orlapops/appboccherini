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
import { File, DirectoryEntry, FileEntry } from "@ionic-native/file/ngx";
// import { Observable } from 'rxjs';
// import { map } from "rxjs/operators";


@Injectable({
  providedIn: "root"
})
export class RegClientespotenService implements OnInit {
  constructor(
    public _parempre: ParEmpreService,
    private fbDb: AngularFirestore,
    private platform: Platform,
    private storage: Storage,
    private afStorage: AngularFireStorage,
    private http: HttpClient,
    public _visitas: VisitasProvider,
    private file : File
  ) {}
  ngOnInit() {
    console.log("ngoniit RegClientespotenService");
    console.log(this._visitas);
  }

      //Obtiene cliepoten con id
  public getIdRegCliepoten(Id: string) {
    console.log('en getIdRegCliepoten',Id);
    console.log(`/personal/${this._parempre.usuario.cod_usuar}/clientespoten`);
  return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/clientespoten`)
   .doc(Id).valueChanges();
  }

  public grabarCliepoten(objact) {
    console.log('obj act a grabar:',objact);
    console.log('en grabar grabarCliepoten coleccion: ',    
    `/personal/${this._parempre.usuario.cod_usuar}/clientespoten`);
    return this.fbDb
    // tslint:disable-next-line:max-line-length
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/clientespoten`)
    .doc(objact.codigo).set(objact);
  }
  public modificarCliepoten(id, objact) {
    console.log('en grabar modificarCliepoten  coleccion: ',`/personal/${this._parempre.usuario.cod_usuar}/clientespoten`);
    return this.fbDb
    // tslint:disable-next-line:max-line-length
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/clientespoten`)
    .doc(id).update(objact);
  }
public BorrarClienpoten(id){
    return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/clientespoten/`)
    .doc(id).delete();
}  
 //Obtiene clientes potenciales del usuario actual
 public getClientespotenusuar() {
  // tslint:disable-next-line:max-line-length
  console.log('getClientespotenusuar:', `/personal/${this._parempre.usuario.cod_usuar}/clientespoten`);
  return this.fbDb
  // tslint:disable-next-line:max-line-length
  .collection(`/personal/${this._parempre.usuario.cod_usuar}/clientespoten`)
  .snapshotChanges();  
}      

//  //Obtiene actividades de la visita actual
//  public getFotosVisitaActual(ObjVisitaAct) {
//   console.log('getFotosVisitaActual:', `/personal/${this._parempre.usuario.cod_usuar}/rutas/${ObjVisitaAct.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${ObjVisitaAct.id_visita}/fotos`);
//   return this.fbDb
//   .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${ObjVisitaAct.id_visita}/fotos`)
//   .snapshotChanges().pipe(
//     map(actions => actions.map(a => {
//       const data = a.payload.doc.data();
//       const id = a.payload.doc.id;
//       return {id, ...data };
//     })
//       )
//   ) 
// }    

  actualizaFotoClientepotenfirebase(idclie, imageData): Promise<any> {
    const storageRef: AngularFireStorageReference = this.afStorage.ref(`/img_clienpoten/${idclie}`);
    return this.file.resolveLocalFilesystemUrl(imageData).then((fe:FileEntry)=>{
      console.log(fe);
      let { name, nativeURL } = fe;
      let path = nativeURL.substring(0, nativeURL.lastIndexOf("/"));
      console.log(path,"   ",name);
      return this.file.readAsArrayBuffer(path, name);
    }).then(buffer => {
        let imgBlob = new Blob([buffer], {
          type: "image/jpeg"
        });
      return storageRef.put(imgBlob, {
          contentType: 'image/jpeg',
      }).then(() => {
        console.log("enter the put");
        return storageRef.getDownloadURL().subscribe(async (linkref: any) => {
            this.fbDb.collection(`/personal/${this._parempre.usuario.cod_usuar}/clientespoten`).doc(idclie).update({link_foto: linkref});
            
        }); 
      }).catch((error) => {
        console.log('Error actualizaimagenClientefirebase putString img:', error);
      });    
    }).catch((error) => {
      console.log('Error leyendo archivo:', error);
    });
    
  }

}
