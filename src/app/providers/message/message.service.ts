import { Injectable } from '@angular/core';
import messages from './mock-messages';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { VisitasProvider } from '../visitas/visitas.service';
import { ParEmpreService } from '../par-empre.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  messageCounter: number = 0;
  messages: Array<any> = messages;
  // messages: Array<any> ;

  constructor(private fbDb: AngularFirestore,
    public _parempre: ParEmpreService,
    public _visitas: VisitasProvider
    ) {

  }
  //Obtiene mensajes de la ruta
  public getdbDbmensajes() {
    // return this.fbDb.collection('manfechas').snapshotChanges();
    // console.log('getdbDbmensajes idRura:', idRuta);
    // return this.fbDb.collection('mensajes', ref => ref.where('id_ruta', '==', idRuta)).valueChanges();
    return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/mensajes`)
    .snapshotChanges();
  }

  public getIdRegmensaje(Id: string) {
    console.log('en getIdRegmensaje');
    return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/mensajes/`)
       .doc(Id).valueChanges();
  }

  public actualizarMensaje(id, datosact) {
    return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/mensajes/`)
    .doc(id.toString()).update(datosact);
  }

  BorrarMensaje(id) {
    return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/mensajes/`)
    .doc(id.toString()).delete();
  }
}
