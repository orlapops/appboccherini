import { LocationPage } from './../modal/location/location.page';
import { Component,Input, OnInit } from "@angular/core";
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { NavController, ToastController, ActionSheetController, Platform, LoadingController } from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../providers/cliente.service";
import { VisitasProvider } from "../../providers/visitas/visitas.service";
import { RegClientespotenService } from "../../providers/regclientespoten/regclientespoten.service";
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { environment } from '../../../environments/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion.service';
import { ParEmpreService } from '../../providers/par-empre.service';

declare var google:any;

@Component({
  selector: "app-regcliepoten",
  templateUrl: "./regcliepoten.page.html",
  styleUrls: ["./regcliepoten.page.scss"]
})
export class RegCliepotenPage implements OnInit {
  coords: any = { lat: 0, lng: 0 };
  address: string;
  description: string = '';
  link_foto: any = '';
  imagenPreview: string;
  fototomada: any;
  tomofoto = false;
  agmStyles: any[] = environment.agmStyles;
  cargo_posicion = false;
  private photo: string = 'assets/img/logo.png';
  private userId: string;
  public onActclieForm: FormGroup;

  idcliepoten: any = this.route.snapshot.paramMap.get("id");
  tipocrud =  'A';
  registro: any;
  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public geolocation: Geolocation,
    private storage: AngularFireStorage,
    public loadingCtrl: LoadingController,
    public _DomSanitizer: DomSanitizer,
    public toastCtrl: ToastController,
    public _regcliepot: RegClientespotenService,
    private formBuilder: FormBuilder,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public _visitas: VisitasProvider,
    public router: Router,
    public _ubicacionService: UbicacionProvider,
    public _parEmpre: ParEmpreService,    
    private camera: Camera
  ) {
    platform.ready().then(() => {
      // La plataforma esta lista y ya tenemos acceso a los plugins.
      this.cargo_posicion = false;
      console.log('platfom lista');
      // console.log('ult servi ubica ',this._ubicacionService.ultlatitud,this._ubicacionService.ultlongitud,this._ubicacionService.usuario);
      // this.coords.lat = this._ubicacionService.ultlatitud;
      // this.coords.lng = this._ubicacionService.ultlongitud;
    });

  }

  ngOnInit() {
    this.onActclieForm = this.formBuilder.group({
      'codigo': [null, Validators.compose([Validators.required])],
      'nombre': [null, Validators.compose([Validators.required])],
      'direccion': [null, Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.maxLength(70), 
        Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$'),
         Validators.required])],
      'contacto': [null],
      'telefono': [null],
      'celular': [null],
      'notas' : [null, Validators.compose([Validators.required])]
    });
    // asignar valores al formulario

    console.log('regcliepoten idcliepoten:', this.idcliepoten);
    //cargar clie poten de firebase
      if (this.idcliepoten==='0') {
        this.tipocrud = 'A';
        this.onActclieForm.controls['codigo'].setValue('');
        this.onActclieForm.controls['nombre'].setValue('');
        this.onActclieForm.controls['direccion'].setValue(this.address);
        this.onActclieForm.controls['contacto'].setValue('');
        this.onActclieForm.controls['email'].setValue('@');
        this.onActclieForm.controls['telefono'].setValue('');
        this.onActclieForm.controls['celular'].setValue('');
        this.onActclieForm.controls['notas'].setValue('');
          } else {
        this.tipocrud = 'E';
        this._regcliepot.getIdRegCliepoten(this.idcliepoten).subscribe((datos:any) =>{
            console.log('Editar datos actividad ', datos);
            if (datos){
              this.onActclieForm.controls['codigo'].setValue(datos.codigo);
              this.onActclieForm.controls['nombre'].setValue(datos.nombre);
              this.onActclieForm.controls['direccion'].setValue(datos.direccion);
              this.onActclieForm.controls['contacto'].setValue(datos.contacto);
              this.onActclieForm.controls['email'].setValue(datos.email);
              this.onActclieForm.controls['telefono'].setValue(datos.telefono);
              this.onActclieForm.controls['celular'].setValue(datos.celular);
              this.onActclieForm.controls['notas'].setValue(datos.notas);
              this.link_foto = datos.link_foto;
            }
        });
      }      
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
      console.log('en mostrar camara2 imageData:',imageData);
      this.imagenPreview = `data:image/jpeg;base64,${imageData}`; 
      this.fototomada = imageData;
      this.tomofoto = true;
      console.log('this.imagenPreview:', this.imagenPreview);
      // this._regcliepot.actualizaFotoClientepotenfirebase()
      // this._clientes.actualizaimagenClientefirebase(this._visitas.visita_activa_copvdet.cod_tercer,
      //   this._visitas.visita_activa_copvdet.id_dir,
      //   imageData);

     }, (err) => {
      // Handle error
      console.log('Error en camara', JSON.stringify(err));
     });
     console.log('en mostrar camara4');
  }

  grabarClienpoten(){
    const now = new Date();    
    const cliepotengrab = {
      codigo: this.onActclieForm.controls['codigo'].value,
      nombre: this.onActclieForm.controls['nombre'].value,
      direccion: this.onActclieForm.controls['direccion'].value,
      contacto: this.onActclieForm.controls['contacto'].value,
      email: this.onActclieForm.controls['email'].value,
      telefono: this.onActclieForm.controls['telefono'].value,
      celular: this.onActclieForm.controls['celular'].value,
      notas: this.onActclieForm.controls['notas'].value,
      fecha_reporta: now,
      verificado: false,
      usuar_crea: this._parEmpre.usuario.cod_usuar,
      num_usuar: this._parEmpre.usuario.nombre
    }
    console.log('grabarActividad cliepotengrab:', cliepotengrab);
    this._regcliepot.grabarCliepoten(cliepotengrab).then(async res => {
      if (this.tomofoto){
        this._regcliepot.actualizaFotoClientepotenfirebase(cliepotengrab.codigo, this.fototomada);
      }
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message: 'Se adiciono Cliente potencial.',
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
  });
  }
  
  modificarClienpoten(){
    // const fh = Date.now();
    const cliepotengrab = {
      codigo: this.onActclieForm.controls['codigo'].value,
      nombre: this.onActclieForm.controls['nombre'].value,
      direccion: this.onActclieForm.controls['direccion'].value,
      contacto: this.onActclieForm.controls['contacto'].value,
      email: this.onActclieForm.controls['email'].value,
      telefono: this.onActclieForm.controls['telefono'].value,
      celular: this.onActclieForm.controls['celular'].value,
      notas: this.onActclieForm.controls['notas'].value
    }
    console.log('modificarActividad cliepotengrab:', cliepotengrab);
    this._regcliepot.modificarCliepoten(this.idcliepoten, cliepotengrab).then(async res => {
      if (this.tomofoto){
        this._regcliepot.actualizaFotoClientepotenfirebase(this.idcliepoten, this.fototomada);
      }
      console.log('cliepotengrab  modificada res: ', res);
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message: 'Se modifo la cliente potencial.',
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
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

}
