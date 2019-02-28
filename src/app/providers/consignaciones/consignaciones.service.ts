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

  constructor(
    public _parempre: ParEmpreService,
    private fbDb: AngularFirestore,
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






  genera_recibo_netsolin(
    total_recibo,
    tdcto_dchban,
    tdcto_otrban,
    tdcto_dchef,
    tdcto_otref,
    totros_desc,
    tretencion,
    tneto_recibir,
    objformpag
  ) {
    //  pag_efectivo, pag_bancos,
    // pag_cheq1, pag_ch1banco, pag_ch1cuenta, pag_numcheq1, pag_fechach1,
    // pag_cheq2, pag_ch2banco, pag_ch2cuenta, pag_numcheq2, pag_fechach2) {
    console.log(
      "dataos para generar recibo this._visitas.visita_activa_copvdet:",
      this._visitas.visita_activa_copvdet
    );
    // console.log("Recibo a genera this.recibo): ", this.recibocaja);
    // // return new Promise((resolve, reject) => {
    //   resolve(true);
    // });
    this._visitas.visita_activa_copvdet.grb_recibo = false;
    this._visitas.visita_activa_copvdet.resgrb_recibo = "";
    this._visitas.visita_activa_copvdet.recibo_grabado = null;
    this._visitas.visita_activa_copvdet.errorgrb_recibo = false;
    return new Promise((resolve, reject) => {
      let paramgrab = {
        // datos_gen: this._visitas.visita_activa_copvdet.datosgen,
        datos_gen: this._visitas.visita_activa_copvdet,
        // items_recibo: this.recibocaja,
        // total_recibo: total_recibo,
        tdcto_dchban: tdcto_dchban,
        tdcto_otrban: tdcto_otrban,
        tdcto_dchef: tdcto_dchef,
        tdcto_otref: tdcto_otref,
        totros_desc: totros_desc,
        tretencion: tretencion,
        tneto_recibir: tneto_recibir,
        objformpag: objformpag,
      usuario: this._parempre.usuario
      };
      NetsolinApp.objenvrest.filtro = "";
      NetsolinApp.objenvrest.parametros = paramgrab;
      let url =
        this._parempre.URL_SERVICIOS +
        "netsolin_servirestgo.csvc?VRCod_obj=APPGENRECCAJA";
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        console.log(" genera_recibo_netsolin data:", data);
        if (data.error) {
          this._visitas.visita_activa_copvdet.errorgrb_recibo = true;
          this._visitas.visita_activa_copvdet.grb_recibo = false;
          this._visitas.visita_activa_copvdet.resgrb_recibo = data.men_error;
          this._visitas.visita_activa_copvdet.menerrorgrb_recibo =
            data.men_error;
          console.error(" genera_recibo_netsolin ", data.men_error);
         resolve(false);
        } else {
          if (data.isCallbackError || data.error) {
            this._visitas.visita_activa_copvdet.errorgrb_recibo = true;
            this._visitas.visita_activa_copvdet.grb_recibo = false;
            this._visitas.visita_activa_copvdet.resgrb_recibo = data.messages;
            this._visitas.visita_activa_copvdet.menerrorgrb_recibo =
              data.messages[0].menerror;
            console.error(
              " Error genera_recibo_netsolin ",
              data.messages[0].menerror
            );
            resolve(false);
          } else {
            this._visitas.visita_activa_copvdet.errorgrb_recibo = false;
            this._visitas.visita_activa_copvdet.grb_recibo = true;
            this._visitas.visita_activa_copvdet.resgrb_recibo =
              "Se grabo recibo";
            this._visitas.visita_activa_copvdet.recibo_grabado = data;
            console.log("Datos traer genera_recibo_netsolin ", data);
            const objrecibogfb = {
              cod_docume: data.cod_docume,
              num_docume: data.num_docume,
              fecha: data.fecha,
              cod_usuar: this._parempre.usuario.cod_usuar,
              id_visita: this._visitas.visita_activa_copvdet.id_visita,
              direccion: this._visitas.visita_activa_copvdet.direccion,
              id_dir: this._visitas.visita_activa_copvdet.id_dir,
              txt_imp: data.txt_imp,
              detalle: data.recibo_grabado
            };
            const objcajacierre = {
              cod_docume: data.cod_docume,
              num_docume: data.num_docume,
              fecha: data.fecha,
              cod_usuar: this._parempre.usuario.cod_usuar,
              id_visita: this._visitas.visita_activa_copvdet.id_visita,
              direccion: this._visitas.visita_activa_copvdet.direccion,
              id_dir: this._visitas.visita_activa_copvdet.id_dir,
              objformpag: objformpag,
              txt_imp: data.txt_imp,
              detalle: data.recibo_grabado
            };
            this.guardarcierrecajaFb(
              data.cod_tercer,
              data.cod_docume.trim() + data.num_docume.trim(),
              objcajacierre
            );
            this.guardarreciboFb(
              data.cod_tercer,
              data.cod_docume.trim() + data.num_docume.trim(),
              objrecibogfb
            )
              .then(res => {
                console.log("Recibo guardada res: ", res);
                resolve(true);
              })
              .catch(err => {
                console.log("Error guardando recibo en Fb", err);
                resolve(false);
              });
            // resolve(true);
          }
        }
        console.log(" genera_recibo_netsolin 4");
      });
    });
  }
  // Actualiza url firestorage en Netsolin, para cuando se traiga sea màs rapido
  guardarreciboFb(cod_tercer, id, objrecibo) {
    console.log("guardarreciboFb cod_tercer:", cod_tercer);
    console.log("guardarreciboFb id:", id);
    console.log("guardarreciboFb objrecibo:", objrecibo);
    console.log(`/clientes/${cod_tercer}/recibos/`);
    return this.fbDb
      .collection(`/clientes/${cod_tercer}/recibos/`)
      .doc(id)
      .set(objrecibo);
    // return this.fbDb
    // tslint:disable-next-line:max-line-length
    // .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/recibos`)
    // .doc(id).set(objrecibo);
    // .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/recibos`)
    // .doc(id).set(objrecibo);
  }
  //Guardar para el vendedor o usuario datos para cierre, recibo y formas de pago
  guardarcierrecajaFb(cod_tercer, id, objrecibo) {
    console.log("guardarreciboFb cod_tercer:", cod_tercer);
    console.log("guardarreciboFb id:", id);
    console.log("guardarreciboFb objrecibo:", objrecibo);
    console.log(`/clientes/${cod_tercer}/recibos/`);
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
      .collection(
        `/personal/${
          this._parempre.usuario.cod_usuar
        }/resumdiario/${ano}/meses/${mes}/dias`
      )
      .doc(dia.toString())
      .set({ dia: dia.toString() });
      console.log('3');

    //cierre de caja por cada forma de pago
    let lrutafp = `/personal/${
      this._parempre.usuario.cod_usuar
    }/resumdiario/${ano}/meses/${mes}/dias/${dia}/cierrecaja`;
    console.log('3', lrutafp);
    objrecibo.objformpag.forEach(element => {
      console.log(element, element.item.tipopago);
      const idfp =id.trim() + element.item.tipopago.trim();
      console.log('4', lrutafp, idfp);
      const regformapago = this.fbDb.collection(lrutafp).doc(idfp);
      console.log('5', lrutafp, idfp);
      regformapago.set({
        formpago: element.item.tipopago,
        cod_docume: objrecibo.cod_docume,
        num_docume: objrecibo.num_docume,
        fechareg: now,
        referencia: element.item.referencia,
        fecha: element.item.fecha,
        banco: element.item.banco,
        cta_banco: element.item.cta_banco,
        valor: element.item.valor
      });
    });
    console.log('8', lrutafp);
    
    const lruta = `/personal/${
      this._parempre.usuario.cod_usuar
    }/resumdiario/${ano}/meses/${mes}/dias/${dia}/recibos`;
    console.log('9', lruta);
    return this.fbDb
      .collection(lruta)
      .doc(id)
      .set(objrecibo);
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

  public getUltRecibosClienteDirActual() {
    // tslint:disable-next-line:max-line-length
    console.log(
      "getUltRecibosClienteDirActual:",
      `/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/recibos`
    );
    // return this.fbDb.collection('rutas_d', ref => ref.where('id_reffecha', '==', fechaid).orderBy('fecha_in')).valueChanges();
    return this.fbDb
      .collection(
        `/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/recibos`,
        ref =>
          ref
            .where("id_dir", "==", this._visitas.visita_activa_copvdet.id_dir)
            .orderBy("fecha", "desc")
            .limit(10)
      )
      .snapshotChanges();
    // .where('id_ruta','==',idruta).orderBy('fecha_in')).snapshotChanges();
  }
}
