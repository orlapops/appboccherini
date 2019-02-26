import { Component, OnInit } from "@angular/core";
import { Injectable } from "@angular/core";
import { NetsolinApp } from "../../shared/global";
import { ParEmpreService } from "../par-empre.service";
import { AngularFirestore } from "@angular/fire/firestore";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from "@angular/common/http";
import { ItemFact } from "../../interfaces/interfaces.generales";
import { Platform } from "@ionic/angular";
// Plugin storage
import { Storage } from "@ionic/storage";
import { VisitasProvider } from "../visitas/visitas.service";
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import messages from '../message/mock-messages';
import { resolve } from "url";


@Injectable({
  providedIn: "root"
})
export class ProdsService implements OnInit {
  private prods: any;
  cargoInventarioNetsolin = false;
  cargoInventarioNetsolinPed = false;
  inventario: Array<any> = [];
  inventarioPed: Array<any> = [];
  facturaCounter: number = 0;
  factura: Array<any> = [];
  itemFact: ItemFact;
  pedidoCounter: number = 0;
  pedido: Array<any> = [];
  itemPedido: ItemFact;

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
    console.log("ngoniit prod service visita");
    console.log(this._visitas);
  }

       //Obtiene ultimos pedidos del  clente de la visita actual
 public getUltPedidosClienteDirActual() {
  // tslint:disable-next-line:max-line-length
  console.log('getUltPedidosClienteDirActual:', `/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/pedidos`);
    // return this.fbDb.collection(`/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/pedidos`, ref => 
    //   ref.where('id_dir', '==', this._visitas.visita_activa_copvdet.id_dir)).snapshotChanges();
      return this.fbDb.collection(`/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/pedidos`, ref => 
        ref.where('id_dir', '==', this._visitas.visita_activa_copvdet.id_dir)
        .orderBy('fecha', 'desc')
        .limit(10))
        .snapshotChanges();

    }

    public getIdRegPedido(Id: string) {
      console.log('en getIdRegPedido');
    return this.fbDb
      .collection(`/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/pedidos`)
     .doc(Id).valueChanges();
    }
    
    public getUltFacturasClienteDirActual() {
    // tslint:disable-next-line:max-line-length
    console.log('getUltFacturasClienteDirActual:', `/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/facturas`);
      // return this.fbDb.collection('rutas_d', ref => ref.where('id_reffecha', '==', fechaid).orderBy('fecha_in')).valueChanges();
      return this.fbDb.collection(`/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/facturas`, ref => 
        ref.where('id_dir', '==', this._visitas.visita_activa_copvdet.id_dir)
        .orderBy('fecha', 'desc')
        .limit(10))
        .snapshotChanges();
          // .where('id_ruta','==',idruta).orderBy('fecha_in')).snapshotChanges();
      }

      public getIdRegFactura(Id: string) {
        console.log('en getIdRegFactura');
      return this.fbDb
        .collection(`/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/facturas`)
       .doc(Id).valueChanges();
      }


  // Carga Inventario de la bodega para facturar en Netsolin
  cargaInventarioNetsolin() {
    return new Promise((resolve, reject) => {
      if (this.cargoInventarioNetsolin) {
        console.log(
          "resolve true cargo inventario netsolin por ya estar inciada"
        );
        resolve(true);
      }
      const lparfiltro = {
        bodega: this._parempre.usuario.bod_factura,
        ubicacion: this._parempre.usuario.placa_veh
      };
      //  NetsolinApp.objenvrest.filtro = this.bodega;
      NetsolinApp.objenvrest.filtro = this._parempre.usuario.bod_factura;
      NetsolinApp.objenvrest.parametros = lparfiltro;
      // console.log(" cargaInventarioNetsolin 1");
      let url =
        this._parempre.URL_SERVICIOS +
        "netsolin_servirestgo.csvc?VRCod_obj=INVXBODUBIAPP";
      console.log("cargaInventarioNetsolin url", url);
      console.log(
        "cargaInventarioNetsolin NetsolinApp.objenvrest",
        NetsolinApp.objenvrest
      );
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        // console.log(" cargaInventarioNetsolin data:", data);
        if (data.error) {
          console.error(" cargaInventarioNetsolin ", data.error);
          this.cargoInventarioNetsolin = false;
          this.inventario = null;
          resolve(false);
        } else {
          // console.log("Datos traer cargaInventarioNetsolin ", data.inventario);
          this.cargoInventarioNetsolin = true;
          // this.menerror_usuar="";
          this.inventario = data.inventario;
          resolve(true);
        }
        // console.log(" cargaInventarioNetsolin 4");
      });
    });
  }

  // Carga Inventario de la bodega para pedido en Netsolin
  cargaInventarioNetsolinPedido() {
    return new Promise((resolve, reject) => {
      if (this.cargoInventarioNetsolinPed) {
        // console.log(
        //   "resolve true cargo cargaInventarioNetsolinPedido netsolin por ya estar inciada"
        // );
        resolve(true);
      }
      NetsolinApp.objenvrest.filtro = this._parempre.usuario.bod_pedido;
      console.log('his._parempre.usuario.bod_pedido:', this._parempre.usuario.bod_pedido);
      console.log('NetsolinApp.objenvrest.filtro', NetsolinApp.objenvrest.filtro);
      console.log('NetsolinApp.objenvrest:', NetsolinApp.objenvrest);
      let copiaobjrest = Object.assign(NetsolinApp.objenvrest);
      console.log('copiaobjrest 1:',copiaobjrest);
      copiaobjrest.filtro = 'PTR';
      console.log('copiaobjrest.filtro 2:',copiaobjrest.filtro);
      console.log('copiaobjrest 2:',copiaobjrest);

      // console.log(" cargaInventarioNetsolinPedido 1");
      let url =
        this._parempre.URL_SERVICIOS +
        "netsolin_servirestgo.csvc?VRCod_obj=INVXBODAPP";
      console.log("cargaInventarioNetsolinPedido url", url);
      console.log(
        "cargaInventarioNetsolinPedido NetsolinApp.objenvrest",
        NetsolinApp.objenvrest
      );
      console.log('url:', url);
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        // console.log(" cargaInventarioNetsolinPedido data:", data);
        if (data.error) {
          // console.error(" cargaInventarioNetsolinPedido ", data.error);
          this.cargoInventarioNetsolinPed = false;
          this.inventarioPed = null;
          resolve(false);
        } else {
          // console.log("Datos traer cargaInventarioNetsolinPedido ",data.inventario);
          this.cargoInventarioNetsolinPed = true;
          // this.menerror_usuar="";
          this.inventarioPed = data.inventario;
          resolve(true);
        }
        // console.log(" cargaInventarioNetsolinPedido 4");
      });
    });
  }

    // Actualiza url firestorage en Netsolin, para cuando se traiga sea màs rapido
    actualizaimagenProductoNetsolin(referencia, linkimg) {
      return new Promise((resolve, reject) => {
        let paramgrab = {
          cod_ref: referencia,
          link_img: linkimg
        };
        NetsolinApp.objenvrest.filtro = referencia;
        NetsolinApp.objenvrest.parametros = paramgrab;
        // console.log(" actualizaimagenProductoNetsolin 1");
        let url =
          this._parempre.URL_SERVICIOS +
          "netsolin_servirestgo.csvc?VRCod_obj=APPACTLINKIMG";
        // console.log("actualizaimagenProductoNetsolin url", url);
        // console.log(
        //   "actualizaimagenProductoNetsolin NetsolinApp.objenvrest",
        //   NetsolinApp.objenvrest
        // );
        this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
          // console.log(" actualizaimagenProductoNetsolin data:", data);
          if (data.error) {
            console.error(" actualizaimagenProductoNetsolin ", data.error);
            this.cargoInventarioNetsolinPed = false;
            this.inventarioPed = null;
            resolve(false);
          } else {
            // console.log("Datos traer actualizaimagenProductoNetsolin ",data);
            resolve(true);
          }
          // console.log(" actualizaimagenProductoNetsolin 4");
        });
      });
    }
  
  //actualizar link imagen verifica si en firestorage imagenes producto existe y actualiza el lin
  actLinkimg(){
    return new Promise((resolve, reject) => {
    for (let i = 0; i < this.inventario.length; i++) {  
      let lcodref = this.inventario[i].cod_refinv;
      let larchivo = '/imagenes/' + lcodref.trim() + '.jpg';
      const ref = this.afStorage.ref(larchivo);
      // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref);
      // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL.length);
      // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL());
      this.inventario[i].link_imgfb = '';
      ref.getDownloadURL().subscribe((url: any) =>  {
        this.inventario[i].link_imgfb = url;
        //actualizar en netsolin
        this.actualizaimagenProductoNetsolin(this.inventario[i].cod_refinv, url);
          // console.log('En actLinkimg suscribe url:' + larchivo, url);        
      });
    }
    resolve(true);
  });
  }

  //actualizar link imagen verifica si en firestorage imagenes producto existe y actualiza el lin
  actLinkimgPed(){
    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.inventarioPed.length; i++) {  
      let lcodref = this.inventarioPed[i].cod_refinv;
      let larchivo = '/imagenes/' + lcodref.trim() + '.jpg';
      const ref = this.afStorage.ref(larchivo);
      // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref);
      // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL.length);
      // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL());
      this.inventarioPed[i].link_imgfb = '';
      ref.getDownloadURL().subscribe((url: any) =>  {
        this.inventarioPed[i].link_imgfb = url;
        //actualizar en netsolin
        this.actualizaimagenProductoNetsolin(this.inventarioPed[i].cod_refinv, url);
          // console.log('En actLinkimg suscribe url:' + larchivo, url);        
      });
    }
    resolve(true);
  });
  }


  //guardar el inventario factura en firebase
  public guardarInvdFB(id, inventario) {
    // console.log("guardarInvdFB id:", id, inventario);
    return this.fbDb
      .collection("inventario")
      .doc(id)
      .set(inventario);
  }
  //guardar el inventario pedido en firebase
  public guardarInvdFBpedido(id, inventario) {
    // console.log("guardarInvdFBpedido id:", id, inventario);
    return this.fbDb
      .collection("inven_ped")
      .doc(id)
      .set(inventario);
  }

  //Obtiene inventario bodega factura de firebase
  public getInvdFB(inventarId: string) {
    // console.log("en getInvdFB");
    return this.fbDb
      .collection("inventario")
      .doc(inventarId)
      .valueChanges();
  }

  //Obtiene inventario bodega factura de firebase
  public getInvdFBpedido(inventarId: string) {
    // console.log("en getInvdFBpedido");
    return this.fbDb
      .collection("inven_ped")
      .doc(inventarId)
      .valueChanges();
  }

  //cargar de firebase el inventario factura suscribirse para que quede actualizado
  cargaInventariodFB(bodega) {
    this.getInvdFB(bodega).subscribe((datos: any) => {
      // console.log("En cargaInventariodFB 1 datos:", datos);
      if (datos) {
        // console.log(
        //   "obtuvo inventario de firebase inventario antes:",
        //   this.inventario
        // );
        // console.log("obtuvo inventario de firebase actual datos:", datos);
        this.inventario = datos.inventario;
        // console.log(
        //   "obtuvo inventario de firebase inventario despues:",
        //   this.inventario
        // );
      }
    });
  }

  //cargar de firebase el inventario pedido suscribirse para que quede actualizado
  cargaInventariodFBpedido(bodega) {
    this.getInvdFBpedido(bodega).subscribe((datos: any) => {
      // console.log("En cargaInventariodFBpedido 1 datos:", datos);
      if (datos) {
        // console.log(
        //   "obtuvo inventario de firebase cargaInventariodFBpedido antes:",
        //   this.inventarioPed
        // );
        // console.log(
        //   "obtuvo inventario de firebase cargaInventariodFBpedido actual datos:",
        //   datos
        // );
        this.inventarioPed = datos.inventario;
        // console.log(
        //   "obtuvo inventario de firebase inventario cargaInventariodFBpedido despues:",
        //   this.inventarioPed
        // );
      }
    });
  }

  buscarProducto(searchKey: string) {
    // console.log("buscarProducto searchKey:", searchKey);
    let key: string = searchKey.toUpperCase();
    // console.log("buscarProducto key:", key);
    console.log(this.inventario);
    return Promise.resolve(
      this.inventario.filter(
        (item: any) =>
          item.cod_refinv.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 ||
          item.nombre.toLowerCase().indexOf(searchKey.toLowerCase()) > -1
      )
    );
  }

  buscarProductoPed(searchKey: string) {
    // console.log("buscarProductoPed searchKey:", searchKey);
    let key: string = searchKey.toUpperCase();
    // console.log("buscarProductoPed key:", key);
    console.log(this.inventarioPed);
    return Promise.resolve(
      this.inventarioPed.filter(
        (item: any) =>
          item.cod_refinv.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 ||
          item.nombre.toLowerCase().indexOf(searchKey.toLowerCase()) > -1
      )
    );
  }

  getProd(id) {
    for (let i = 0; i < this.inventario.length; i++) {
      if (this.inventario[i].cod_refinv === id) {
        return this.inventario[i];
      }
    }
    return null;
  }

  getProdPed(id) {
    for (let i = 0; i < this.inventarioPed.length; i++) {
      if (this.inventarioPed[i].cod_refinv === id) {
        return this.inventarioPed[i];
      }
    }
    return null;
  }
    //REsta las existencias despues de grabar un pedido en matriz de productos a pedir
    restaExistenciasprodxpedido(){
      this.pedido.forEach((val, i) => {
        for (let i = 0; i < this.inventarioPed.length; i++) {
          if (this.inventarioPed[i].cod_refinv === val.item.cod_ref) {
             this.inventarioPed[i].existencia -= val.item.cantidad;
            }
        }
      });
    }

    //REsta las existencias despues de grabar una factura en matriz de productos a facturar
  restaExistenciasprodxfact(){
    this.factura.forEach((val, i) => {
      for (let i = 0; i < this.inventario.length; i++) {
        if (this.inventario[i].cod_refinv === val.item.cod_ref) {
           this.inventario[i].existencia -= val.item.cantidad;
          }
      }
    });
  }

  //adiciona un item a factura
  addfactura(item, cantidad) {
    console.log("add item factura item llega:", item);
    let exist = false;

    if (this.factura && this.factura.length > 0) {
      this.factura.forEach((val, i) => {
        if (val.item.cod_ref === item.cod_refinv) {
          val.item.cantidad = cantidad;
          val.item.total = val.item.precio * cantidad;
          exist = true;
        }
      });
    }

    if (!exist) {
      this.facturaCounter = this.facturaCounter + 1;
      const itemAdi = {
        cod_ref: item.cod_refinv,
        nombre: item.nombre,
        precio: item.precio_ven,
        cantidad: cantidad,
        link_imgfb: item.link_imgfb,
        por_iva: item.por_iva,
        total: item.precio_ven * cantidad
      };
      // console.log("Item a adicionar:", itemAdi);
      this.factura.push({ id: this.facturaCounter, item: itemAdi });
    }
    // console.log("Factura lista :", this.factura);
    this.guardar_storage_factura();
    return Promise.resolve();
  }
  //adiciona un item a pedido
  addpedido(item, cantidad) {
    // console.log("add item pedido item llega:", item);
    this.pedidoCounter = this.pedidoCounter + 1;
    let exist = false;

    if (this.pedido && this.pedido.length > 0) {
      this.pedido.forEach((val, i) => {
        if (val.item.cod_ref === item.cod_refinv) {
          val.item.cantidad = cantidad;
          val.item.total = val.item.precio * cantidad;
          exist = true;
        }
      });
    }

    if (!exist) {
      const itemAdi = {
        cod_ref: item.cod_refinv,
        nombre: item.nombre,
        precio: item.precio_ven,
        cantidad: cantidad,
        link_imgfb: item.link_imgfb,
        por_iva: item.por_iva,
        total: item.precio_ven * cantidad
      };
      // console.log("Item a adicionar pedido:", itemAdi);
      this.pedido.push({ id: this.pedidoCounter, item: itemAdi });
    }
    // console.log("Pedido lista :", this.pedido);
    this.guardar_storage_pedido();
    return Promise.resolve();
  }
  getFactura() {
    return Promise.resolve(this.factura);
  }

  getPedido() {
    return Promise.resolve(this.pedido);
  }

  //saca un elemento de la factura
  borraritemfactura(item) {
    let index = this.factura.indexOf(item);
    if (index > -1) {
      this.factura.splice(index, 1);
    }
    this.facturaCounter = this.facturaCounter - 1;
    this.guardar_storage_factura();
    return Promise.resolve();
  }

  //saca un elemento de la pedido
  borraritempedido(item) {
    let index = this.pedido.indexOf(item);
    if (index > -1) {
      this.pedido.splice(index, 1);
    }
    this.pedidoCounter = this.pedidoCounter - 1;
    this.guardar_storage_pedido();
    return Promise.resolve();
  }

  getitemFactura(id) {
    for (let i = 0; i < this.factura.length; i++) {
      if (this.factura[i].item.cod_ref === id) {
        return this.factura[i].item;
      }
    }
    return null;
  }

  getitemPedido(id) {
    for (let i = 0; i < this.pedido.length; i++) {
      if (this.pedido[i].item.cod_ref === id) {
        return this.pedido[i].item;
      }
    }
    return null;
  }

  public guardar_storage_factura() {
    // console.log("ngoniit prod service visita");
    // console.log(this._visitas.visita_activa);
    const idruta = this._visitas.visita_activa_copvdet.id_ruta;
    const idvisiact = this._visitas.visita_activa_copvdet.id_visita;
    const idifact = idruta.toString() + idvisiact.toString();
    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.set("itemfac" + idifact, this.factura);
    } else {
      // computadora
      localStorage.setItem("itemfac" + idifact, JSON.stringify(this.factura));
    }
  }

  public guardar_storage_pedido() {
    const idruta = this._visitas.visita_activa_copvdet.id_ruta;
    const idvisiact = this._visitas.visita_activa_copvdet.id_visita;
    // const idruta = this._visitas.visita_activa_copvdet.datosgen.id_ruta;
    // const idvisiact = this._visitas.visita_activa_copvdet.datosgen.id_visita;
    const idiped = idruta.toString() + idvisiact.toString();
    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.set("itemped" + idiped, this.pedido);
    } else {
      // computadora
      localStorage.setItem("itemped" + idiped, JSON.stringify(this.pedido));
    }
  }
  public borrar_storage_pedido() {
    const idruta = this._visitas.visita_activa_copvdet.id_ruta;
    const idvisiact = this._visitas.visita_activa_copvdet.id_visita;
    const idiped = idruta.toString() + idvisiact.toString();
    this.pedido = [];
    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.remove("itemped" + idiped);
    } else {
      // computadora
      localStorage.removeItem("itemped" + idiped);
    }
  }

  cargar_storage_factura(idruta, idvisiact) {
    // console.log("cargar_storage_factura 1", this._visitas);
    // // let idruta = this._visitas.visita_activa_copvdet.datosgen.id_ruta;
    // console.log("cargar_storage_factura 2", idruta);
    // // let idvisiact = this._visitas.visita_activa_copvdet.datosgen.id_visita;
    // console.log("cargar_storage_factura 3", idvisiact);
    let idifact = idruta.toString() + idvisiact;
    // console.log("cargar_storage_factura 4", idifact);
    this.factura = [];
    let promesa = new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        // dispositivo
        this.storage.ready().then(() => {
          this.storage.get("itemfac" + idifact).then(items => {
            if (items) {
              this.factura = items;
            }
            resolve();
          });
        });
      } else {
        // computadora
        // console.log("carga del storage factura 0 ");
        if (localStorage.getItem("itemfac" + idifact)) {
          //Existe items en el localstorage
          // console.log("carga del storage factura 1");
          this.factura = JSON.parse(localStorage.getItem("itemfac" + idifact));
          // console.log("carga del storage factura 2: ", this.factura);
        }
        resolve();
      }
    });
    return promesa;
  }

  public borrar_storage_factura() {
    const idruta = this._visitas.visita_activa_copvdet.id_ruta;
    const idvisiact = this._visitas.visita_activa_copvdet.id_visita;
    let idifact = idruta.toString() + idvisiact;
    this.factura = [];
    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.remove("itemfac" + idifact);
    } else {
      // computadora
      localStorage.removeItem("itemfac" + idifact);
    }
  }
  cargar_storage_pedido(idruta, idvisiact) {
    // console.log("cargar_storage_pedido 1", this._visitas);
    // // let idruta = this._visitas.visita_activa_copvdet.datosgen.id_ruta;
    // console.log("cargar_storage_pedido 2", idruta);
    // // let idvisiact = this._visitas.visita_activa_copvdet.datosgen.id_visita;
    // console.log("cargar_storage_pedido 3", idvisiact);
    let idiped = idruta.toString() + idvisiact;
    // console.log("cargar_storage_pedido 4", idiped);
    this.pedido = [];
    let promesa = new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        // dispositivo
        this.storage.ready().then(() => {
          this.storage.get("itemped" + idiped).then(items => {
            if (items) {
              this.pedido = items;
            }
            resolve();
          });
        });
      } else {
        // computadora
        // console.log("carga del storage pedido 0 ");
        if (localStorage.getItem("itemped" + idiped)) {
          //Existe items en el localstorage
          // console.log("carga del storage pedido 1");
          this.pedido = JSON.parse(localStorage.getItem("itemped" + idiped));
          // console.log("carga del storage pedido 2: ", this.pedido);
        }
        resolve();
      }
    });
    return promesa;
  }

  
  genera_pedido_netsolin() {
    console.log('dataos para generar pedido this._visitas.visita_activa_copvdet:', this._visitas.visita_activa_copvdet);
    console.log('Pedido a genera this.pedido): ', this.pedido);
    // return new Promise((resolve, reject) => {
    //   resolve(true);
    // });
    this._visitas.visita_activa_copvdet.grb_pedido = false;
    this._visitas.visita_activa_copvdet.resgrb_pedido = '';
    this._visitas.visita_activa_copvdet.pedido_grabado = null;
    this._visitas.visita_activa_copvdet.errorgrb_pedido = false;
    return new Promise((resolve, reject) => {
      let paramgrab = {
        // datos_gen: this._visitas.visita_activa_copvdet.datosgen,
        datos_gen: this._visitas.visita_activa_copvdet,
        items_pedido: this.pedido,
        usuario: this._parempre.usuario
      };
      NetsolinApp.objenvrest.filtro = '';
      NetsolinApp.objenvrest.parametros = paramgrab;
      let url =
        this._parempre.URL_SERVICIOS +
        "netsolin_servirestgo.csvc?VRCod_obj=APPGENPEDIDO";
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        console.log(" genera_pedido_netsolin data:", data);
        if (data.error) {
          this._visitas.visita_activa_copvdet.errorgrb_pedido = true;
          this._visitas.visita_activa_copvdet.grb_pedido = false;
          this._visitas.visita_activa_copvdet.resgrb_pedido = data.men_error;      
          this._visitas.visita_activa_copvdet.menerrorgrb_pedido = data.men_error;
          console.error(" genera_pedido_netsolin ", data.men_error);
          // this.cargoInventarioNetsolinPed = false;
          // this.inventarioPed = null;
          resolve(false);
        } else {
          if (data.isCallbackError || data.error) {
            this._visitas.visita_activa_copvdet.errorgrb_pedido = true;
            this._visitas.visita_activa_copvdet.grb_pedido = false;
            this._visitas.visita_activa_copvdet.resgrb_pedido = data.messages;      
            this._visitas.visita_activa_copvdet.menerrorgrb_pedido = data.messages[0].menerror;
            console.error(" Error genera_pedido_netsolin ", data.messages[0].menerror);
            resolve(false);
          } else {
          this._visitas.visita_activa_copvdet.errorgrb_pedido = false;
          this._visitas.visita_activa_copvdet.grb_pedido = true;
          this._visitas.visita_activa_copvdet.resgrb_pedido = 'Se grabo pedido';      
          this._visitas.visita_activa_copvdet.pedido_grabado = data;
          console.log("Datos traer genera_pedido_netsolin ",data);
          const objpedidogfb ={
            cod_dpedid : data.cod_dpedidg,
            num_dpedid : data.num_dpedidg,
            fecha : data.fecha,
            cod_usuar : this._parempre.usuario.cod_usuar,
            id_visita : this._visitas.visita_activa_copvdet.id_visita,
            direccion : this._visitas.visita_activa_copvdet.direccion,
            id_dir : this._visitas.visita_activa_copvdet.id_dir,
            txt_imp : data.txt_imp,
            detalle : data.ped_grabado
          };
            this.guardarpedidoFb(data.cod_tercer, data.cod_dpedidg.trim() + data.num_dpedidg.trim(), objpedidogfb).then(res => {
              console.log('Pedido guardada res: ', res);
              // console.log('Pedido guardada res id: ', res.id);
              resolve(true);
            })
            .catch((err) => {
                console.log('Error guardando pedido en Fb', err);
                resolve(false);
            });
            // resolve(true);
          }
        }
        console.log(" genera_pedido_netsolin 4");
      });
    });
  }
    // Actualiza url firestorage en Netsolin, para cuando se traiga sea màs rapido
    guardarpedidoFb(cod_tercer, id, objpedido) {
      // console.log('en grabar guardarpedidoFb coleccion: ',`/personal/${this._parempre.usuario.cod_usuar}
      // /rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}
      // /visitas/${this._visitas.visita_activa_copvdet.id_visita}/pedidos`);
      return this.fbDb.collection(`/clientes/${cod_tercer}/pedidos/`).doc(id).set(objpedido);
      // return this.fbDb
      // tslint:disable-next-line:max-line-length
      // .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/pedidos`)
      // .doc(id).set(objpedido);
      // .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/pedidos`)
      // .doc(id).set(objpedido);
    }

    genera_factura_netsolin() {
      console.log('dataos para generar factura this._visitas.visita_activa_copvdet:', this._visitas.visita_activa_copvdet);
      console.log('Factura a genera this.pedido): ', this.factura);
      this._visitas.visita_activa_copvdet.grb_factu = false;
      this._visitas.visita_activa_copvdet.resgrb_factu = '';
      this._visitas.visita_activa_copvdet.factura_grabada = null;
      this._visitas.visita_activa_copvdet.errorgrb_factu = false;
      return new Promise((resolve, reject) => {
        let paramgrab = {
          // datos_gen: this._visitas.visita_activa_copvdet.datosgen,
          datos_gen: this._visitas.visita_activa_copvdet,
          items_factura: this.factura,
          usuario: this._parempre.usuario
        };
        NetsolinApp.objenvrest.filtro = '';
        NetsolinApp.objenvrest.parametros = paramgrab;
        let url =
          this._parempre.URL_SERVICIOS +
          "netsolin_servirestgo.csvc?VRCod_obj=APPGENFACTURA";
        this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
          console.log(" genera_factura_netsolin data:", data);
          if (data.error) {
            this._visitas.visita_activa_copvdet.errorgrb_factu = true;
            this._visitas.visita_activa_copvdet.grb_factu = false;
            this._visitas.visita_activa_copvdet.resgrb_factu = data.men_error;      
            this._visitas.visita_activa_copvdet.menerrorgrb_factu = data.men_error;
            console.error(" genera_factura_netsolin ", data.men_error);
            resolve(false);
          } else {
            if (data.isCallbackError || data.error) {
              this._visitas.visita_activa_copvdet.errorgrb_factu = true;
              this._visitas.visita_activa_copvdet.grb_factu = false;
              this._visitas.visita_activa_copvdet.resgrb_factu = data.messages;      
              this._visitas.visita_activa_copvdet.menerrorgrb_factu = data.messages[0].menerror;
              console.error(" Error genera_factura_netsolin ", data.messages[0].menerror);
              resolve(false);
            } else {
            this._visitas.visita_activa_copvdet.errorgrb_factu = false;
            this._visitas.visita_activa_copvdet.grb_factu = true;
            this._visitas.visita_activa_copvdet.resgrb_factu = 'Se grabo factura';      
            this._visitas.visita_activa_copvdet.factura_grabada = data;
            console.log("Datos traer genera_factura_netsolin ",data);
            const objfacturagfb ={
              cod_dfactur : data.cod_dfacturg,
              num_dfactur : data.num_dfacturg,
              fecha : data.fecha,
              cod_usuar : this._parempre.usuario.cod_usuar,
              id_visita : this._visitas.visita_activa_copvdet.id_visita,
              direccion : this._visitas.visita_activa_copvdet.direccion,
              id_dir : this._visitas.visita_activa_copvdet.id_dir,
              txt_imp : data.txt_imp,
              detalle : data.factura_grabada
            };
              this.guardarfacturaFb(data.cod_tercer, data.cod_dfacturg.trim() + data.num_dfacturg.trim(), objfacturagfb).then(res => {
                console.log('Factura guardada res: ', res);
                resolve(true);
              })
              .catch((err) => {
                  console.log('Error guardando factura en Fb', err);
                  resolve(false);
              });
              // resolve(true);
            }
          }
          console.log(" genera_factura_netsolin 4");
        });
      });
    }
      // Actualiza url firestorage en Netsolin, para cuando se traiga sea màs rapido
      guardarfacturaFb(cod_tercer, id, objfactura) {
        return this.fbDb.collection(`/clientes/${cod_tercer}/facturas/`).doc(id).set(objfactura);
      }    
}


// }
//   traerimagenducha(){
//     console.log('En traer imagenes ducha prueba 0114');
//     let larchivo = `/imagenes/0114.jpg`;
//     const ref = this.afStorage.ref(larchivo);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL.length);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL());
//     ref.getDownloadURL().subscribe((data: any) =>  {
//         console.log('En traer imagenes ducha suscribe data:' + larchivo, data);        
//     });
//     larchivo = `/imagenes/noexis0114.jpg`;
//    const  ref1 = this.afStorage.ref(larchivo);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref1);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref1.getDownloadURL.length);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref1.getDownloadURL());
//     ref1.getDownloadURL().subscribe((data: any) =>  {
//         console.log('En traer imagenes ducha suscribe data no existe:' + larchivo, data);        
//     });
//     // this.profileUrl = ref.getDownloadURL();
//     // console.log('En traer imagenes ducha prueba profileUrl:',  this.profileUrl);
//     return ref.getDownloadURL();
//     // console.log('En traer imagenes ducha prueba profileUrl:',  this.profileUrl);

// }
