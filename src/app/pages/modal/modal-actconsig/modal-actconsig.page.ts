import { Component, Input, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { NavController, ModalController, ActionSheetController, Platform, LoadingController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConsignacionesService } from '../../../providers/consignaciones/consignaciones.service';


@Component({
  selector: 'app-modal-actconsig',
  templateUrl: './modal-actconsig.page.html',
  styleUrls: ['./modal-actconsig.page.scss'],
})
export class ModalActConsigPage implements OnInit {
  @Input() idcs: any;
  address: string;
  imagenPreview: string;
  cargo_posicion = false;
  consignacion: any;
  private photo: string = 'assets/img/logo.png';
  
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  title = 'app';
  public onActclieForm: FormGroup;

  constructor(private modalCtrl: ModalController,
    public platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private storage: AngularFireStorage,
    public loadingCtrl: LoadingController,
    public _DomSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    public _consigna: ConsignacionesService,
    private camera: Camera) { 
      platform.ready().then(() => {
        // La plataforma esta lista y ya tenemos acceso a los plugins.
        console.log('llega id:',  this.idcs);
        this._consigna.getconsigna(this.idcs).subscribe((datoscs: any) => {
            this.consignacion = datoscs;
            console.log('Consignacion: ', this.consignacion);
        });
        console.log('platfom lista');
      });
    }  

  ngOnInit() {
    console.log('llega ngOnInit id:',  this.idcs);

  }
  async presentLoading(pmensaje) {
    const loading = await this.loadingCtrl.create({
      message: pmensaje,
      spinner: 'dots',
      duration: 2000
    });
    return await loading.present();
  }

 
  mostrar_camara(){
    console.log('en mostrar camara1');
    const optionscam: CameraOptions = {
      quality: 30,
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
      this._consigna.actualizaFotoConsignafirebase(this.idcs,this.consignacion.fecha, imageData)
     }, (err) => {
      console.log('Error en camara', JSON.stringify(err));
     });
     console.log('en mostrar camara4');
  }

  
  cerrarModal(){
    this.modalCtrl.dismiss();
  }
  

  }
