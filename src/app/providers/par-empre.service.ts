import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Storage } from '@ionic/storage';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// import { Http } from '@angular/http';
// import { map, filter, switchMap } from 'rxjs/operators';
// import { map } from 'rxjs/operators';
// import 'rxjs/add/operator/map';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';


import { NetsolinApp } from '../shared/global';
// import {URL_NETSOLIN} from "../config/url.servicios";

export interface Item { name: string; }

@Injectable({
  providedIn: 'root'
})
export class ParEmpreService {
  DEPURANDO = true;
  parEmpre: any = {};
  licenValida=false;
  datoslicencia: any={};
  usuario: any={};
  usuario_valido=false;
  menerror_usuar="";
  // private itemDoc: AngularFirestoreDocument<Item>;
  item: Observable<Item>;
  URL_SERVICIOS: string ="";
  idreglog = 'depuracion1';
  

  constructor(
    private afDB: AngularFirestore,
    private platform: Platform,
    private storage: Storage,
    private fbDb: AngularFirestore,
    // public http: Http
    private http: HttpClient
    // public http: Http

  ) {

   }

reg_log(titulo, mensaje){
  const fd = new  Date();
  // const fds = fd.toISOString();
  const id = fd.toLocaleString().replace(/[/]/g, '-');
  // fd.getFullYear().toString()+fd.getMonth().toString()+fd.getDay().toString()+fd.toLocaleTimeString();
  this.afDB
  .collection(`/log/depura1/dos`)
  .doc(id)
  .set({fecha: id, titulo: titulo, mensaje: mensaje});

  // .add({fecha: fds, titulo: titulo, mensaje: mensaje});

  // return this.fbDb
  // .collection("inventario")
  // .doc(id)
  // .set(inventario);
}
  // Carga bancos definidos en Netsolin
  cargaBancosNetsolin() {
    return new Promise((resolve, reject) => {
      console.log('ingreso a cargaBancosNetsolin');
      NetsolinApp.objenvrest.filtro = '';
      let url =this.URL_SERVICIOS +"netsolin_servirestgo.csvc?VRCod_obj=APPBANCOS";
      console.log('ingreso a cargaBancosNetsolin url', url, NetsolinApp.objenvrest);
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        console.log('ingreso a cargaBancosNetsolin data', data);
        if (data.error) {
          console.error(" cargaBancosNetsolin ", data.error);
          resolve(false);
        } else {
          console.log('ingreso a cargaBancosNetsolin cargo bancos');
          this.guardarBancosFB(data) .then(resultado => {
              if (resultado) {
                resolve(true);
              }
          });
        }
      });
    });
  }
 //guardar bancos firebase
 public guardarBancosFB(data) {
  return new Promise((resolve, reject) => {
  console.log('guardarBancosFB:');
  console.log(data);
  let bancolist: AngularFirestoreCollection<any>;
  bancolist = this.fbDb.collection(`bancos/`);
  data.bancos.forEach((banco: any) => {
    console.log('recorriendo bancos : ', banco);
    const idbanco   = banco.cod_banco;
    console.log('recorriendo bancos :idciudad ', idbanco);
    const reg_banco = {
      cod_banco: banco.cod_banco,
      banco: banco.banco
    };
    console.log('reg_banco a graba ren firebase', idbanco, reg_banco);
    bancolist.doc(idbanco).set(reg_banco);
  });
  resolve(true);
});
}

  // Carga ciudades definidas en Netsolin
  cargaCiudadesNetsolin() {
    return new Promise((resolve, reject) => {
      console.log('ingreso a cargaCiudadesNetsolin');
      NetsolinApp.objenvrest.filtro = '';
      let url =this.URL_SERVICIOS +"netsolin_servirestgo.csvc?VRCod_obj=APPCIUDADES";
      console.log('ingreso a cargaCiudadesNetsolin url', url, NetsolinApp.objenvrest);
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        console.log('ingreso a cargaCiudadesNetsolin data', data);
        if (data.error) {
          console.error(" cargaCiudadesNetsolin ", data.error);
          resolve(false);
        } else {
          console.log('ingreso a cargaCiudadesNetsolin cargo ciudades');
          this.guardarCiudadesFB(data) .then(resultado => {
              if (resultado) {
                resolve(true);
              }
          });
        }
      });
    });
  }
 //guardar ciudades en firebase
 public guardarCiudadesFB(data) {
  return new Promise((resolve, reject) => {
  console.log('guardarCiudadesFB:');
  console.log(data);
  let ciudadlist: AngularFirestoreCollection<any>;
  ciudadlist = this.fbDb.collection(`ciudades/`);
  data.ciudades.forEach((ciudad: any) => {
    console.log('recorriendo ciudades :ciudad ', ciudad);
    const idciudad   = ciudad.cod_ciudad;
    console.log('recorriendo ciudades :idciudad ', idciudad);
    const reg_ciudad = {
      cod_ciudad: ciudad.cod_ciudad,
      ciudad: ciudad.ciudad
    };
    ciudadlist.doc(idciudad).set(reg_ciudad);
  });
  resolve(true);
});
}

  //Obtiene tipos actividades de FB
  public getbancosFB() {
    return this.fbDb
      .collection("bancos")
      .valueChanges();
  }

// Verifica usuario en url de empresa en Netsolin
verificausuarioNetsolin(codigo: string,psw:string,plogeo:string ) {
  this.licenValida=false;
  let promesa = new Promise((resolve,reject)=>{
    NetsolinApp.objenvrest.filtro = codigo;
    NetsolinApp.objenvrest.usuario=codigo;
    NetsolinApp.objenvrest.psw = psw;
    console.log(" verificausuarioNetsolin 1 this.URL_SERVICIOS: "+this.URL_SERVICIOS);
    //  console.log(codigo);    
    let url= this.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=VALUSUARAPP&VTIPOLOG="+plogeo;
    console.log(url);
    // console.log(NetsolinApp.objenvrest);
    // console.log(" verificausuarioNetsolin 2");
    this.http.post( url, NetsolinApp.objenvrest )   
     .subscribe( (data:any) =>{ 
      console.log(" verificausuarioNetsolin 3");
      console.log(data);  
      if( data.error){
          console.log(" verificausuarioNetsolin 31");
        // Aqui hay un problema
         console.log('data.messages');
         console.log(data.menerror);
         this.usuario_valido=false;
         this.menerror_usuar="Error llamando servicio verificar usaurio en Netsolin "+data.menerror;
         this.usuario = null;
         resolve(false);
        }else{
          // console.log(" verificausuarioNetsolin 32");
          // console.log('Datos traer verificausuarioNetsolin');
          this.usuario_valido=true;
          this.menerror_usuar="";
          this.usuario = data;
          // console.log(data);
          resolve(true);
        }
      // console.log(" verificaLicencia 4");
     })
    //  console.log(" verificaLicencia 5");
   });
   return promesa;
}

  
// Verifica licencia en sistemas integrales de colombia
verificaLicencia( nit: string ) {
    this.licenValida=false;
    let promesa=new Promise((resolve,reject)=>{
      NetsolinApp.objenvrest.filtro = nit;
      // console.log(" verificaLicencia 1");
      // console.log(nit);
      
      // let url= URL_NETSOLIN + "netsolin_servirestgo.csvc?VRCod_obj=VALLICENAPPS"
      let url = NetsolinApp.urlNetsolinverilicen + "netsolin_servirestgo.csvc?VRCod_obj=VALLICENAPPS"
      console.log(url);
      console.log(NetsolinApp.objenvrest);
      // console.log(" verificaLicencia 2");
      this.http.post( url, NetsolinApp.objenvrest )   
       .subscribe( (data:any) =>{ 
        console.log(" verificaLicencia 3");
        console.log(data);
        if(data.error){
          console.log('error verificando licencia:'+data.menerror)
          this.licenValida = false;
          this.datoslicencia = null;
          this.URL_SERVICIOS = '';
          resolve(false);
        }else{
          // console.log('se verifico licencia ok');
          // console.log('Datos traer licencia');
          this.licenValida = true;
          this.datoslicencia = data;
          this.URL_SERVICIOS = this.datoslicencia.url_publica;
          // console.log(data);
          resolve(true);
        }
        // console.log(" verificaLicencia 4");
       })
      //  console.log(" verificaLicencia 5");
          // resolve(false);
     });
     return promesa;
}

  verificaParametro() {
    var clave = 'general';
    return new Promise( (resolve, reject) => {
    this.afDB.doc(`/par_empre/${ clave }`)
      .valueChanges().subscribe( data => {
          // console.log(data);
            if (data) {
              // correcto
              this.parEmpre = data;
              this.guardarStorage(this.parEmpre);
              resolve(true);
            } else{ 
              // incorrecto
              resolve(false);
            }
            resolve();
        })
      });
  }


  guardarLicenciaStorage() {

    if ( this.platform.is('cordova')  ){
      // Celular
      console.log('guardarlicencia storage cordova this.datoslicencia:', this.datoslicencia);
      this.storage.set('net_licencia', this.datoslicencia)
      .then(()=>{
          console.log('guardo la licencia en storage cordova bien');
      })
      .catch (error=>{
        console.log('NO guardo la licencia en storage cordovA ERROR: ',error);
      });
    } else {
      // Escritorio
      localStorage.setItem('net_licencia', JSON.stringify(this.datoslicencia));
    }

  }

  cargarLicenciaStorage() {
    return new Promise( (resolve, reject) => {
      if ( this.platform.is('cordova')  ){
        // Celular    
        console.log('en cargalicencia del storage cordova');   
        // this.reg_log('clicen', 'cargarLicenciaStorage con cordova');
        this.storage.get('net_licencia').then( val => {
          console.log('en cargalicencia del storage cordova val, ', val);   
          if ( val ) {
            console.log('en cargalicencia del storage cordova val 2 if ', val);   
            // this.reg_log('cargarLicenciaStorage con cordova val:', val);
            this.datoslicencia = val;
            this.URL_SERVICIOS = this.datoslicencia.url_publica;
            resolve(true);
          }else {
            console.log('en cargalicencia storage cordova else if val');
            // this.reg_log('clicen', 'cargarLicenciaStorage con cordova retorna falso');
            resolve(false);
          }
        })
        .catch(error=>{
          console.log('Error en cargalicencia storage cordova error:', error);
          resolve(false);
        });        
      } else {
        // Escritorio
        // this.reg_log('clicen', 'cargarLicenciaStorage desktop');
        // console.log('carga licencia storage 1');
        if ( localStorage.getItem('net_licencia')){
          // console.log('carga licencia storage 2');         
          this.datoslicencia = JSON.parse( localStorage.getItem("net_licencia"));
          // this.reg_log('cargarLicenciaStorage desktop datoslicencia', this.datoslicencia);
          // this.parEmpre = localStorage.getItem('net_licencia');
          // console.log('carga licencia storage 3');
          // console.log(this.datoslicencia);
          this.URL_SERVICIOS = this.datoslicencia.url_publica;
          //si tiene firebase inicializar
          if (this.datoslicencia.util_firebase){
            // var config = {
            //   apiKey: "AIzaSyDz_d6qIjTAN_-lU8neFAKQIbnmMkqpKoU",
            //   authDomain: "catalogo-43ff6.firebaseapp.com",
            //   databaseURL: "https://catalogo-43ff6.firebaseio.com",
            //   projectId: "catalogo-43ff6",
            //   storageBucket: "catalogo-43ff6.appspot.com",
            //   messagingSenderId: "254647114546"
            //  };    
            //  TestBed.configureTestingModule({
            //   imports: [
            //     AngularFireModule.initializeApp(config),
            //   ]
            // });             
            // const appnetsolinpar = AngularFireModule.initializeApp(this.datoslicencia.key_firebase);
            // const appnetsolinpar = AngularFireModule.initializeApp(config);
            // console.log('Verificando par en db netsolin appnetsolinpar:');
            // console.log(appnetsolinpar);
          }
          resolve(true);
        }else {
          // this.reg_log('clic', 'cargarLicenciaStorage desktop datoslicencia retorna falso');
          console.log('resuelve falso no hay en storage datos licencia');
          resolve(false);
        }        
      }
    });
  }


  borrarLicenciaStorage() {

    this.parEmpre = null;

    if ( this.platform.is('cordova') ) {
      this.storage.remove('net_licencia');
    }else {
      localStorage.removeItem('net_licencia');
    }

    // this.doc.unsubscribe();

  }


  guardarStorage(datos) {

    if ( this.platform.is('cordova')  ){
      // Celular
      this.storage.set('par_empe',datos);

    } else {
      // Escritorio
      localStorage.setItem('par_empre', datos);
    }

  }

  cargarStorage() {
    return new Promise( (resolve, reject) => {
      if ( this.platform.is('cordova')  ){
        // Celular       
        this.storage.get('par_empre').then( val => {
          if ( val ) {
            this.parEmpre = val;
            resolve(true);
          }else {
            resolve(false);
          }
        });        
      } else {
        // Escritorio
        if ( localStorage.getItem('par_empre')){
          this.parEmpre = localStorage.getItem('par_empre');
          resolve(true);
        }else {
          resolve(false);
        }        
      }
    });
  }


  borrarParempre() {

    this.parEmpre = null;

    if ( this.platform.is('cordova') ) {
      this.storage.remove('par_empre');
    }else {
      localStorage.removeItem('par_empre');
    }

    // this.doc.unsubscribe();

  }


  guardarUsuarioStorage() {
    return new Promise( (resolve, reject) => {
    if ( this.platform.is('cordova')  ){
      // Celular
      console.log('Usuario a guardar en cordova: ', this.usuario);
      // this.reg_log('guardarUsuarioStorage con cordova usuario:', this.usuario);
      this.storage.set('net_usuario',this.usuario);
      resolve(true);
    } else {
      // Escritorio
      localStorage.setItem('net_usuario', JSON.stringify(this.usuario));
      resolve(true);
    }
  });
  }

  cargarUsuarioStorage() {
    return new Promise( (resolve, reject) => {
      if ( this.platform.is('cordova')  ){  
        // this.reg_log('cargarUsuarioStorage', 'cargarUsuarioStorage con cordova');
        // Celular       
        this.storage.get('net_usuario').then( val => {
          // this.reg_log('cargarUsuarioStorage', val);
          if ( val ) {
            // this.reg_log('cargarUsuarioStorage con cordova val:', val);
           this.usuario = val;
            resolve(true);
          }else {
            // this.reg_log('cargarUsuarioStorage', 'cargarLicenciaStorage con cordova retorna falso');
            resolve(false);
          }
        });        
      } else {
        // Escritorio
        if ( localStorage.getItem('net_usuario')){
          this.usuario = JSON.parse( localStorage.getItem("net_usuario"));
          resolve(true);
        }else {
          resolve(false);
        }        
      }
    });
  }


  borrarUsuarioStorage() {

    this.usuario = null;

    if ( this.platform.is('cordova') ) {
      this.storage.remove('net_usuario');
    }else {
      localStorage.removeItem('net_usuario');
    }
  }

//sERVICIOS COMO FUNCIONES DE LIBRERIA ADICIONALES A JS
//COMPLETA UNA CADENA CON 0 A LA IZQUIERDA DE NUMERO Y LONGITUD DADA

 zfill(number, width) {
  var numberOutput = Math.abs(number); /* Valor absoluto del número */
  var length = number.toString().length; /* Largo del número */ 
  var zero = "0"; /* String de cero */  
  
  if (width <= length) {
      if (number < 0) {
           return ("-" + numberOutput.toString()); 
      } else {
           return numberOutput.toString(); 
      }
  } else {
      if (number < 0) {
          return ("-" + (zero.repeat(width - length)) + numberOutput.toString()); 
      } else {
          return ((zero.repeat(width - length)) + numberOutput.toString()); 
      }
  }
}
//cadena formato AAAAMMDD A FECHA TIEMPO 0
cadafecha(cfecha){
  let ano = cfecha.slice(0,4);
  let mes = cfecha.slice(4,6);
  let dia = cfecha.slice(6,8);

  let dfecha = new Date(ano,mes,dia,0,0,0);
  return dfecha;
}

//recibe hora militar como numero y retorna cadena formato HH:MM AM/PM
cadhoramil(nhora){
  let ch = nhora.toString();
  let chh = '';
  let cmm = '';
  let campm = '';
  let nnh = 0;
  if (nhora < 1000) {
    chh = ch.slice(0,1);
    cmm = ch.slice(1,3); 
  } else {
    chh = ch.slice(0,2);
    cmm = ch.slice(2,4);  
  }
  if(nhora < 1200){
    campm = 'AM';      
  } else {
    nnh = parseInt(chh) - 12;
    chh = nnh.toString();
    campm = 'PM';      
  }

  return chh+':'+cmm+' '+campm;
}


diferenciaEntreDiasEnDias(a, b)
{
  const MILISENGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / MILISENGUNDOS_POR_DIA);
}


}
