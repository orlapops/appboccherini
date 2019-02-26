import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, ToastController, ModalController, Platform, LoadingController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagePage } from './../modal/image/image.page';
import { environment } from '../../../environments/environment'
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
import { ParEmpreService } from '../../providers/par-empre.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { ProdsService } from '../../providers/prods/prods.service';
import { RecibosService } from '../../providers/recibos/recibos.service';
// import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalActClientePage } from '../modal/modal-actcliente/modal-actcliente.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActividadesService } from '../../providers/actividades/actividades.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';


@Component({
  selector: 'app-visita-detail',
  templateUrl: './visita-detail.page.html',
  styleUrls: ['./visita-detail.page.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('300ms', [animate('600ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class VisitaDetailPage implements OnInit {
  visita: any;
  visitaID: any = this.route.snapshot.paramMap.get('id'); 
  visitaAct: any;
  clienteAct: any;
  ubicaAct: any;
  agmStyles: any[] = environment.agmStyles;
  visitaSegment: string = 'details';
  estadoVisita: string = '';
  cargoCartera = false;
  buscar_item: string = '';
  buscar_itemped: string = '';
  q: any;
  productos_bus: any;
  searching: any = false;
  qped: any;
  productos_busped: any;
  searchingped: any = false;
  // imagenmuest: string;
  // linkimgprod: string;
  coords: any = { lat: 0, lng: 0 };
  cargoVisitaActual = false;
  cargo_ubicaact = false;
  cargo_clienteact = false;
  listaactividades: any;
  imagenPreview: string;
  listafotos: any;
  cargo_posicion = false;

  constructor(
    public _parEmpre: ParEmpreService,
    public _cliente: ClienteProvider,
    public navCtrl: NavController,
    public asCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public geolocation: Geolocation,
    private translate: TranslateProvider,
    public _visitas: VisitasProvider,
    public _prods: ProdsService,
    public _recibos: RecibosService,
    public _actividad: ActividadesService,
    public route: ActivatedRoute,
    public _DomSanitizer: DomSanitizer,
    public router: Router,
    private camera: Camera,
    public loadingCtrl: LoadingController,
    private impresora: BluetoothSerial
  ) {   
    platform.ready().then(() => {
      // La plataforma esta lista y ya tenemos acceso a los plugins.
      this.cargo_posicion = false;
      console.log('platfom lista');
      this.obtenerPosicion();
            // console.log('envando a pruba impresora');
            // this.impresora.write('Hola mundo').then(() => {} );
          });
    // console.log('constructor detalle visita');
    // console.log(this.visitaID);
    this.visita = this._visitas.getItem(this.visitaID);
    // console.log('constructor detalle visita 2 this.visita:', this.visita);    
    this.cargo_clienteact = false;
    this.cargo_clienteact = false;
    this.cargo_ubicaact = false;
    this._visitas.actualizarclientenetsolinFb(this.visita.data.cod_tercer).then(result =>{
      // console.log('Actualizar cliente netsolin result:', result);
      if (result){
        //Suscribirse a cliente actual fb
        this._cliente.getClienteFb(this.visita.data.cod_tercer).subscribe((datos: any) => {
            console.log('Suscribe a clientes fb ', datos);
            this.clienteAct = datos;
            this.cargo_clienteact = true;
            //encontrar ubicacion actual en arreglo
            this.ubicaAct = null;
            this.cargo_ubicaact = false;
            // console.log('a buscar ubica act ',this.visita.data.cod_tercer, this.visita.data.id_dir);
            for (var i = 0; i < this.clienteAct.direcciones.length; i++) {
              if (this.clienteAct.direcciones[i].id_dir === this.visita.data.id_dir) {
                // this.ubicaAct = this.clienteAct.direcciones[i];
                this._cliente.getUbicaActFb(this.visita.data.cod_tercer, this.visita.data.id_dir).subscribe((datosc: any) => {
                  console.log('susc datos cliente fb ', datosc);
                  this.ubicaAct = datosc;
                  this._visitas.direc_actual = this.ubicaAct;
                  console.log('encontro ubica act; ', this.ubicaAct);
                  this.cargo_ubicaact = true;
                  });
              }
            }
          });
        // //Suscribirse a direccion actual fb
        // this._cliente.getUbicaActFb(this.visita.data.cod_tercer, this.visita.data.id_dir).subscribe((datos: any) => {
        //   console.log('Suscribe a ubicacion actual fb ', datos);
        //   if (datos){
        //     this.ubicaAct = datos;
        //     this.cargo_ubicaact = true;
        //   }
        // });
      this._visitas.getVisitaActual(this.visitaID).subscribe((datos: any) => {
          // console.log('constructor detalle visita getVisitaActual datos:', datos);                
          this.visitaAct = datos;
          this._visitas.visita_activa_copvdet = datos;
          this.cargoVisitaActual = true;
          // console.log('constructor detalle visita 4 this.visitaAct: ', this.visitaAct);
          this._actividad.getActividadesVisitaActual(this.visitaAct).subscribe((datosa: any) => {
            // console.log('actividades de la visita: ', datosa);
            this.listaactividades = datosa;
            // console.log(this.listaactividades.id);
            // console.log(this.listaactividades.payload.doc);
            // console.log(this.listaactividades.payload.doc.data());
            // console.log(this.listaactividades.payload.doc.id);
          });
          this._actividad.getFotosVisitaActual(this.visitaAct).subscribe((datosf: any) => {
            // console.log('Fotos de la visita: ', datosf);
            this.listafotos = datosf;
            // console.log('Fotos de la visita listafotos: ', this.listafotos);
            // console.log(this.listaactividades.id);
            // console.log(this.listaactividades.payload.doc);
            // console.log(this.listaactividades.payload.doc.data());
            // console.log(this.listaactividades.payload.doc.id);
          });
        });
      }
    })
    .catch(error => {
      console.log('Error al actualizarclientenetsolinFb error.message:', error);
    });
    // console.log('constructor detalle visita 3');


  //     // if (datos) {
  //     //   console.log('constructor detalle visita getVisitaActual datos true:', datos);                
  //     //     this.visitaAct = datos;
  //     // } else {
  //     //   console.log('constructor detalle visita getVisitaActual datos false:', datos);                
  //     //   this.visitaAct = null;
  //     // }
  //   });
  }

  ngOnInit() {
    // console.log('ngoniit visita detalle');
    // console.log(this.visita);
    this._prods.cargar_storage_factura(this.visita.data.id_ruta, this.visita.id);
    this._prods.cargar_storage_pedido(this.visita.data.id_ruta, this.visita.id);
    this._recibos.cargar_storage_recibo(this.visita.data.id_ruta, this.visita.id);
    this._recibos.cargar_storage_formpago(this.visita.data.id_ruta, this.visita.id);
  }

  obtenerPosicion(): any {
    console.log('en obtener posicion', this.coords);
    this.geolocation
      .getCurrentPosition()
      .then(res => {
        this.coords.lat = res.coords.latitude;
        this.coords.lng = res.coords.longitude;
        this.cargo_posicion = true;
        console.log('res ok obtener posicion', this.coords);
        // this.loadMap();
      })
      .catch(error => {
        console.log(error.message);
        this.coords.lat = 4.625749001284896;
        this.coords.lng = -74.078441;
        this.cargo_posicion = true;
        console.log('res error obtener posicion', this.coords);
        // this.loadMap();
      });
  }

  async actualizarCliente() {
    console.log('a actualizar cliente modal coords:', this.coords);
    const modal = await this.modalCtrl.create({
      component: ModalActClientePage,
      // componentProps: { fromto: fromto, search: this.search }
      componentProps: { coords: this.coords }
    });
    return await modal.present();
  }


  async presentImage(image: any) {
    const modal = await this.modalCtrl.create({
      component: ImagePage,
      componentProps: { value: image }
    });
    return await modal.present();
  }

  async presentLoading(pmensaje) {
    const loading = await this.loadingCtrl.create({
      message: pmensaje,
      spinner: 'dots',
      duration: 3000
    });
    return await loading.present();
  }


  registrarIngresoVisita() {
    const datactvisita = {
      fechahora_ingreso : Date(),
      estado : 'A',
      grb_pedido : false,
      resgrb_pedido : '',
      pedido_grabado : null,
      errorgrb_pedido : false,
      grb_factu : false,
      resgrb_factu : '',
      pedido_factu : null,
      errorgrb_factu : false,
      grb_recibo : false,
      resgrb_recibo : '',
      pedido_recibo : null,
      errorgrb_recibo : false
    };
    this._visitas.actualizarVisita(this.visitaID, datactvisita);
  }

  cerrarVisita() {
    // this.estadoVisita = 'C';
    const datactvisita = {
      fechahora_cierre : Date(),
      estado : 'C'
    };
    this._visitas.actualizarVisita(this.visitaID, datactvisita);
  }
  actualizarGps(){

  }
  
  colorxEstado(estado) {
    if (estado === 'C') {
      return 'bg-red';
    } else {
      if (estado === 'A') {
        return 'bg-verde';
      } else {
        return 'bg-white';
    }
  }
  }

  range(n) {
    return new Array(n);
  }

  avgRating() {
    let average: number = 0;

    this.visita.reviews.forEach((val: any, key: any) => {
      average += val.rating;
    });

    return average / this.visita.reviews.length;
  }

  buscar_productos($event){

    this.q = $event.target.value;
    // console.log('buscar_productos: ', this.q );
    this.searching = true;
    // this._visitas.buscarProducto(this.q).then(lbusq => {
    this._prods.buscarProducto(this.q).then(lbusq => {
      // console.log('lo buscado por producto: ' , lbusq);
      this.productos_bus = lbusq;
      this.searching = false;
      // console.log('lo buscado por producto  this.productos_bus: ' ,  this.productos_bus);

    });    
  }
    buscar_productosped($event){
      this.qped = $event.target.value;
      // console.log('buscar_productos ped: ', this.qped );
      this.searchingped = true;
      // this._visitas.buscarProducto(this.q).then(lbusq => {
      this._prods.buscarProductoPed(this.qped).then(lbusq => {
        // console.log('lo buscado por producto: ' , lbusq);
        this.productos_busped = lbusq;
        this.searchingped = false;
        // console.log('lo buscado por producto  this.productos_bus: ' ,  this.productos_busped);
  
      });    
    //     if (this.q != '') {
  //       this.startAt.next(this.q);
  //       this.endAt.next(this.q + "\uf8ff");
  //     }
  //     else {
  //       this.items = this.all_items;
  //     }
  }
  
  tomafoto(){
      console.log('en tomafoto camara1');
      const optionscam: CameraOptions = {
        quality: 40,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.PNG,
        mediaType: this.camera.MediaType.PICTURE
      };
      this.camera.getPicture(optionscam).then((imageData) => {
        this.presentLoading('Guardando Imagen');
        console.log('en mostrar camara2 optionscam:',optionscam);
        console.log('en mostrar camara2 imageData:',imageData);
        this.imagenPreview = `data:image/jpeg;base64,${imageData}`; 
        console.log('this.imagenPreview:', this.imagenPreview);
        this._actividad.actualizafotosVisitafirebase(this._visitas.visita_activa_copvdet.cod_tercer,
          this.visitaID, imageData);
       }, (err) => {
        // Handle error
        console.log('Error en camara', JSON.stringify(err));
       });
       console.log('en mostrar camara4');
  }


  public eliminarFoto(ifoto){
    console.log('En eliminar foto ', ifoto);

  }

}
