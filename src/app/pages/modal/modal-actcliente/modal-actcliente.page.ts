import { Component, Input, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { NavController, ModalController, ActionSheetController, Platform, LoadingController } from '@ionic/angular';
import { VisitasProvider } from '../../../providers/visitas/visitas.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ClienteProvider } from '../../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
// import { ImagePage } from '../../modal/image/image.page';
import { environment } from '../../../../environments/environment'
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UbicacionProvider } from '../../../providers/ubicacion/ubicacion.service';

declare var google:any;

@Component({
  selector: 'app-modal-actcliente',
  templateUrl: './modal-actcliente.page.html',
  styleUrls: ['./modal-actcliente.page.scss'],
})
export class ModalActClientePage implements OnInit {
  @Input() coords: any;
  address: string;
  description: string = '';
  foto: any = '';
  imagenPreview: string;
  agmStyles: any[] = environment.agmStyles;
  cargo_posicion = false;
  private photo: string = 'assets/img/logo.png';
  private userId: string;

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  title = 'app';
  public onActclieForm: FormGroup;

  constructor(private modalCtrl: ModalController,
    public _visitas: VisitasProvider,
    public platform: Platform,
    public _clientes: ClienteProvider,
    public geolocation: Geolocation,
    private actionSheetCtrl: ActionSheetController,
    private storage: AngularFireStorage,
    public loadingCtrl: LoadingController,
    public _DomSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    public _ubicacionService: UbicacionProvider,
    private camera: Camera) { 
      console.log('llega coords:',  this.coords);
      platform.ready().then(() => {
        // La plataforma esta lista y ya tenemos acceso a los plugins.
        this.cargo_posicion = true;
        // this.coords.lat = this._ubicacionService.ultlatitud;
        // this.coords.lng = this._ubicacionService.ultlongitud;
          console.log('platfom lista');
        // this.obtenerPosicion();

      });
    }  

  ngOnInit() {
    console.log('ngOnInit ModalActClientePage this._visitas.visita_activa: ', this._visitas.visita_activa);
    console.log('ngOnInit ModalActClientePage _clientes.clienteActual:', this._clientes.clienteActual);
    console.log('ngOnInit ModalActClientePage _visitas.direc_actual:', this._visitas.direc_actual);
    this.onActclieForm = this.formBuilder.group({
      'direccion': [null, Validators.compose([
        Validators.required
      ])],
      email: ['', Validators.compose([Validators.maxLength(70), 
        Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$'),
         Validators.required])],
      // 'email': [null, Validators.compose([
      //   Validators.required
      // ])],
      'contacto': [null, Validators.compose([
        Validators.required
      ])],
      'telefono': [null, Validators.compose([
        Validators.required
      ])],
      'celular': [null]

    });
    // asignar valores al formulario
    this.onActclieForm.controls['direccion'].setValue(this._visitas.direc_actual.direccion);
    this.onActclieForm.controls['email'].setValue(this._visitas.direc_actual.email);
    this.onActclieForm.controls['contacto'].setValue(this._visitas.direc_actual.contacto);
    this.onActclieForm.controls['telefono'].setValue(this._visitas.direc_actual.telefono);
    this.onActclieForm.controls['celular'].setValue(this._visitas.direc_actual.celular);
    // this.coords.lat = this.navParams.get('lat');
    // this.coords.lng = this.navParams.get('lng');
    this._ubicacionService.getUbicaUsuarFb().subscribe((datosc: any) => {
      console.log('susc usuar para localiza fb ', datosc);
      this.coords.lat = datosc.latitud;
      this.coords.lng = datosc.longitud;  
      this.cargo_posicion = true;
      this.getAddress(this.coords).then(results=>{
        console.log('getAddress');
        console.log(results);
        this.address = results[0]['formatted_address'];      
        const ldiract = this.onActclieForm.controls['direccion'].value;
        console.log(ldiract);
        if (ldiract==undefined || ldiract==''){
          console.log('a act direccion');
          this.onActclieForm.controls['direccion'].setValue(this.address);
        }
      },errStatus=>{
        //Aqui codigo manejo error
      })   
    });
  }
  async presentLoading(pmensaje) {
    const loading = await this.loadingCtrl.create({
      message: pmensaje,
      spinner: 'dots',
      duration: 2000
    });
    return await loading.present();
  }

  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = 'demo126';
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    
    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
        finalize(() => this.downloadURL = fileRef.getDownloadURL() )
     )
    .subscribe()
  // }    
  //   // get notified when the download URL is available
  //   this.downloadURL = task.downloadURL();
  }
  uploadFile1(event) {
    const file = event.target.files[0];
    const filePath = 'imagenes/archvio1.pdf';
    const ref = this.storage.ref(filePath);
    console.log('uploadFile file:', file);
    console.log('uploadFile filePath:', filePath);
    console.log('uploadFile ref:', ref);
    const task = ref.putString(file)
    .then(() => {
      const llinkkret = ref.getDownloadURL();
      console.log('subio arch llinkkret: ', llinkkret)
  });
  }
 
  mostrar_camara(){
    console.log('en mostrar camara1');
    const optionscam: CameraOptions = {
      quality: 60,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.camera.getPicture(optionscam).then((imageData) => {
      this.presentLoading('Guardando Imagen');
      console.log('en mostrar camara2');
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      console.log('en mostrar camara2 imageData:',imageData);
      this.imagenPreview = `data:image/jpeg;base64,${imageData}`; 
      console.log('this.imagenPreview:', this.imagenPreview);
      this._clientes.actualizaimagenClientefirebase(this._visitas.visita_activa_copvdet.cod_tercer,
        this._visitas.visita_activa_copvdet.id_dir,
        imageData);
        // this.imagenPreview);
     }, (err) => {
      // Handle error
      console.log('Error en camara', JSON.stringify(err));
      // const nomarch='imagenp.jpg';
      // const imgprueba = "Qk0qAQAAAAAAAHYAAAAoAAAAEQAAAA8AAAABAAQAAAAAALQAAAATCwAAEwsAAAAAAAAAAAAAAAAAAAAAgAAAgAAAAICAAIAAAACAAIAAgIAAAICAgADAwMAAAAD/AAD/AAAA//8A/wAAAP8A/wD//wAA////AP//////////8AkJCf+Hd3d3d3d38AkJCf8AAAAAAAAH8AkJCf8P7+/v7+8H8AkJCf8OAA4AAA4H8AkJCf8P7+8P/w8H8AkJCf8OAA4AAA4H8AkJCf8P7+/v7+8H8AkJCf8OAA4AAA4H8AkJCf8P7+8P/w8H8AkJCf8OAA4AAA4H8AkJCf8P7+/v7+8H8AkJCf8AAAAAAAAI8AkJCf//////////8AkJCf//////////8AkJCQ=="      
      // console.log('Error en camara imgprueba:', imgprueba);
      // this._clientes.actualizaimagenClientefirebase(this._visitas.visita_activa_copvdet.cod_tercer, 
      //   this._visitas.visita_activa_copvdet.id_dir,
      //   imgprueba);
     });
     console.log('en mostrar camara4');

  }

  actualiza_ubicaciongps(){
    console.log('actualiza_ubicaciongps', this.coords);
    const adireccion = this.onActclieForm.controls['direccion'].value;
    const aemail = this.onActclieForm.controls['email'].value;
    const acontacto = this.onActclieForm.controls['contacto'].value;
    let atelefono = this.onActclieForm.controls['telefono'].value;
    let acelular = this.onActclieForm.controls['celular'].value;
    if (typeof atelefono == "undefined") {
      atelefono = "";
    }
    if (typeof acelular == "undefined") {
      acelular = "";
    }
    console.log('Datos act:', adireccion, aemail, acontacto,atelefono,acelular);
    this._clientes.actualizaubicafirebase(this._visitas.visita_activa_copvdet.cod_tercer, 
      this._visitas.visita_activa_copvdet.id_dir,
      this.coords.lng, this.coords.lat,
      adireccion, aemail, acontacto,atelefono,acelular);
     // Actualizar ubicacion visita actual
    //  this._visitas.direc_actual.direccion = adireccion;
    //  this._visitas.direc_actual.email = aemail;
    //  this._visitas.direc_actual.contacto = acontacto;
    //  console.log('Datos despues act:', this._visitas.direc_actual.direccion, 
    //  this._visitas.direc_actual.email, this._visitas.direc_actual.contacto);
     const datactvisita = {
      estado : 'A',
      latitud : this.coords.lat,
      longitud : this.coords.lng
    };
    //actualiza direc actual en memoria

    this._visitas.actualizarVisita(this._visitas.visita_activa_copvdet.id_visita, datactvisita);
    this.presentLoading('Actualizando ubicación');
    // this._visitas.actualizarUbicaVisitaAct(this.coords.lng, this.coords.lat);
  }

  getAddress(coords):any{
    var geocoder = new google.maps.Geocoder();
    return new Promise(function(resolve,reject){
      geocoder.geocode({'location':coords},function(results,status){
        //llamado asincronicamente
        if(status == google.maps.GeocoderStatus.OK){
          resolve(results);
        } else {
          reject(status);
        }
      })
    });
  }

  cerrarModal(){
    this.modalCtrl.dismiss();
  }
  

  sacarFoto(){

  }
guardarNuevaVisita(){

}
// obtenerPosicion(): any {
//   console.log('en obtener posicion', this.coords);
//   this.geolocation
//     .getCurrentPosition()
//     .then(res => {
//       this.coords.lat = res.coords.latitude;
//       this.coords.lng = res.coords.longitude;
//       this.cargo_posicion = true;
//       console.log('res ok obtener posicion', this.coords);
//     })
//     .catch(error => {
//       console.log(error.message);
//       this.coords.lat = 4.625749001284896;
//       this.coords.lng = -74.078441;
//       this.cargo_posicion = true;
//       console.log('res error obtener posicion', this.coords);
//     });
// }
}
