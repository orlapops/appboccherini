import { Injectable } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { ParEmpreService } from '../providers/par-empre.service';
import { NetsolinApp } from '../shared/global';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AngularFireStorageReference, AngularFireStorage } from '@angular/fire/storage';
import { VisitasProvider } from './visitas/visitas.service';
// tslint:disable-next-line:no-empty-interface
export interface Icliente {
    cod_tercer: string;
    cliente: string;
    cod_vended: string;
    vendedor: string;
    cod_lista: string;
    lista: string;
    cod_fpago: string;
    for_pago: string;
    inactivo: boolean;
    cartera: Array<any>;
    direcciones: Array<any>;
 }

@Injectable({
  providedIn: 'root'
})

export class ClienteProvider {
    //AQUI CAMBIAR PARA QUE TRAIGA LA BODEGA QUE LE PERTENECE A LA RUTA
    cod_tercer = '';
    clienteactualA: AngularFirestoreDocument<any>;
    public clienteActual: Icliente;    
    public cargo_cliente = false;
    public error_cargacliente = false;
    public men_errorcargacliente = "";
    direcciones: Array<any> = [];
    cargoclienteNetsolin = false;
    public dclienteFb: any;
    
    constructor(private fbDb: AngularFirestore,
        public navCtrl: NavController,
        public toastCtrl: ToastController,
        private http: HttpClient,
        private afStorage: AngularFireStorage,
        public _parempre: ParEmpreService) {
            console.log('en constructor cliente ', this.clienteActual);
    }
    

    //guarda o actualiza el cliente actual en coleccion clientes de firestore
    public guardarClienteFb(id){
        // console.log('guardarCliente id:' + id);
        // console.log(this.clienteActual);
      return this.fbDb.collection('clientes').doc(id).set(this.clienteActual);
    }
    
    public getUbicaActFb(idclie, iddirec){
      // console.log('getUbicaActFb idclie:' + idclie);
      // console.log('getUbicaActFb iddirec:' + iddirec);
      // console.log(this.clienteActual);
      let id_direc = iddirec.toString();
    return this.fbDb.collection(`clientes/${idclie}/direcciones`).doc(id_direc).valueChanges();
  }
  
  public getClienteFb(idclie){
    // console.log('getClienteFb idclie:' + idclie);    
    return this.fbDb.collection(`clientes`).doc(idclie).valueChanges();
  }

    public guardardireccionesCliente(id){
      // console.log('guardardireccionesCliente id:' + id);
      // console.log(this.direcciones);
      let dirlist: AngularFirestoreCollection<any>;
      dirlist = this.fbDb.collection(`clientes/${id}/direcciones/`);
      this.direcciones.forEach((direc: any) => {
        // console.log('recorriendo direcciones :direc ', direc);
        let iddir   = direc.id_dir;
        // console.log('recorriendo direcciones :iddir ', iddir.toString());
        dirlist.doc(iddir.toString()).set(direc);
      });   
    }
  
    public guardardireccionesClienteFb(id, direcciones) {
      // console.log('guardardireccionesCliente id:' + id);
      // console.log(direcciones);
      return new Promise((resolve, reject)=>{
        let dirlist: AngularFirestoreCollection<any>;
        dirlist = this.fbDb.collection(`clientes/${id}/direcciones/`);
        direcciones.forEach((direc: any) => {
          // console.log('recorriendo direcciones :direc ', direc);
          let iddir   = direc.id_dir;
          // console.log('recorriendo direcciones :iddir ', iddir.toString());
          dirlist.doc(iddir.toString()).set(direc);
        });
        resolve(true);
      });
    }
  

    chequeacliente(){
      console.log('cheque cliente this.clienteactualA: ', this.clienteactualA);
    }

    //Carga un cliente de Netsolin 
    cargaClienteNetsolin(cod_tercer: string) {
        let promesa = new Promise((resolve,reject)=>{
        // if (this.cargoclienteNetsolin){
        //     console.log('resolve true cargo cargaClienteNetsolin por ya estar inciada');
        //     resolve(true); 
        //  }
          this.clienteActual = null;
          NetsolinApp.objenvrest.filtro = cod_tercer;
          // console.log(" cargaClienteNetsolin 1");
          let url= this._parempre.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=CARTEXCLIEAPP";
          // console.log(url);
          // console.log(NetsolinApp.objenvrest);
          // console.log(" cargaClienteNetsolin 2");
          this.http.post( url, NetsolinApp.objenvrest )   
           .subscribe( (data:any) =>{ 
            console.log(" cargaClienteNetsolin 3");
            console.log(data);  
            if( data.error){
                // console.log(" cargaClienteNetsolin 31");
              // Aqui hay un problema
              //  console.log('data.messages');
              //  console.log(data.menerror);
               this.cargoclienteNetsolin = false;
            //    this.menerror_usuar="Error llamando servicio cargaClienteNetsolin en Netsolin "+data.menerror;
               this.clienteActual = null;
               resolve(false);
              }else{
                // console.log(" cargaClienteNetsolin 32");
                // console.log(data);
                // console.log(data.datos_gen[0]);
                // console.log(data.datos_gen[0].cod_tercer);
                this.cargoclienteNetsolin = true;
                // console.log('en llamar cliente por metodo directo fb ', this.clienteActual);
                // this.clienteactualA = this.fbDb.doc(`/clientes/${data.datos_gen[0].cod_tercer}`);
    
                // tslint:disable-next-line:prefer-const
                let clieAux: Icliente;
                // this.menerror_usuar="";
                clieAux = {
                    cod_tercer  : data.datos_gen[0].cod_tercer,
                    cliente : data.datos_gen[0].cliente,
                    cod_fpago : data.datos_gen[0].cod_fpago,
                    for_pago : data.datos_gen[0].for_pago,
                    cod_vended : data.datos_gen[0].cod_vended,
                    vendedor : data.datos_gen[0].vendedor,
                    cod_lista : data.datos_gen[0].cod_lista,
                    lista : data.datos_gen[0].lista,
                    inactivo : data.datos_gen[0].inactivo,
                    cartera : data.cartera,
                    direcciones : data.direcciones
                };
                this.direcciones = data.direcciones;
                // console.log('Datos traer cargaClienteNetsolin');
                // console.log('clieAux: ', clieAux);
                this.clienteActual = clieAux;
                // console.log(this.clienteActual);
                resolve(true);
              }
            // console.log(" cargaClienteNetsolin 4");
           });
          //  console.log(" cargaClienteNetsolin 5");
         });
         return promesa;
      }

  actualizaimagenClientefirebase(idclie, iddirec, imageURL): Promise<any> {
    const storageRef: AngularFireStorageReference = this.afStorage.ref(`/img_clientes/${idclie}/direcciones/${iddirec}`);
    // this._parempre.reg_log('a actualizar img fb clie: ' , idclie);
    // this._parempre.reg_log('a actualizar img fb iddirec: ' , iddirec);
    // this._parempre.reg_log('a actualizar img fb imageURL: ' , imageURL);
    // console.log('en actualizaimagenClientefirebase idclie,iddirec: ', idclie, iddirec);
    return storageRef
      .putString(imageURL, 'base64', {
        contentType: 'image/png',
      })
      .then(() => {
        // this._parempre.reg_log('a actualizar img fb clie 2 then: ' , idclie);
        // console.log('a a ctualizar foto cliente ', idclie);          
        return storageRef.getDownloadURL().subscribe(async (linkref: any) => {
          // this._parempre.reg_log('a actualizar img fb linkref: ' , linkref);
          // console.log(linkref);
            let id_direc = iddirec.toString();
            // console.log(id_direc);
            // this._parempre.reg_log('a actualizar img fb id_direc: ' , id_direc);
            this.actualizaimagenDirclienteNetsolin(idclie, iddirec, 0, 0, linkref,'','','');
            this.fbDb.collection(`/clientes/${idclie}/direcciones/`).doc(id_direc).update({link_foto: linkref});
            const toast = await this.toastCtrl.create({
              showCloseButton: true,
              message: 'Se actualizo la foto del cliente.',
              duration: 2000,
              position: 'bottom'
            });
            toast.present();
        }); 
    })
    .catch((error) => {
      console.log('Error actualizaimagenClientefirebase putString img:', error);
    });
  }

  actualizaubicafirebase(idclie, iddirec, longitud, latitud, pdireccion, pemail, pcontacto) {
    // const storageRef: AngularFireStorageReference = this.afStorage.ref(`/img_clientes/${idclie}/direcciones/${iddirec}`);
    // this._parempre.reg_log('a actualizar ubi fb clie: ' , idclie);
    console.log('en actualizaubicafirebase idclie,iddirec: ', idclie, iddirec);    
    console.log('en actualizaubicafirebase longitud,latitud: ', longitud, latitud);    
   let id_direc = iddirec.toString();
   console.log('Datos actualizaubicafirebase act:', pdireccion, pemail, pcontacto);

  //  console.log(id_direc);
  //  this._parempre.reg_log('a actualizar ubi fb id_direc: ' , id_direc);
  this.actualizaimagenDirclienteNetsolin(idclie, iddirec, longitud, latitud, '', pdireccion, pemail, pcontacto);
  this.fbDb.collection(`/clientes/${idclie}/direcciones/`).doc(id_direc).update({latitud: latitud, longitud: longitud,
    direccion: pdireccion, email: pemail, contacto: pcontacto});
  }

  // Actualiza url firestorage en Netsolin DIRECCION DE UN CLIENTE, para cuando se traiga sea màs rapido
    actualizaimagenDirclienteNetsolin(idclie, iddirec, longitud, latitud, imageURL: string, pdireccion, pemail, pcontacto) {
      console.log('Datos actualizaimagenDirclienteNetsolin act:', pdireccion, pemail, pcontacto);
      return new Promise((resolve, reject) => {
        const paramgrab = {
          id_dir: iddirec,
          link_img: imageURL,
          longitud: longitud,
          latitud: latitud,
          direccion: pdireccion,
          email: pemail,
          contacto: pcontacto
        };
        NetsolinApp.objenvrest.parametros = paramgrab;
        console.log("  1");
        let url =
          this._parempre.URL_SERVICIOS +
          "netsolin_servirestgo.csvc?VRCod_obj=APPACTIDIRLCLIE";
        // console.log("actualizaimagenDirclienteNetsolin url", url);
        // console.log(
        //   "actualizaimagenDirclienteNetsolin NetsolinApp.objenvrest",
        //   NetsolinApp.objenvrest
        // );
        this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
          // console.log(" actualizaimagenDirclienteNetsolin data:", data);
          if (data.error) {
            console.error(" actualizaimagenDirclienteNetsolin ", data.error);
            resolve(false);
          } else {
             console.log("Datos traer actualizaimagenDirclienteNetsolin ",data);
            resolve(true);
          }
          // console.log(" actualizaimagenDirclienteNetsolin 4");
        });
      });
    }
  

}
