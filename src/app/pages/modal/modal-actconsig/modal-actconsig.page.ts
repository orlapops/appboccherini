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
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File, DirectoryEntry, FileEntry } from "@ionic-native/file/ngx";


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
  
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  title = 'app';
  public onActclieForm: FormGroup;

  constructor(private modalCtrl: ModalController,
    public platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private storage: AngularFireStorage,
    private imagePicker: ImagePicker,
    public loadingCtrl: LoadingController,
    public _DomSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    public _consigna: ConsignacionesService,
    private camera: Camera,
    private file: File,
    private webview: WebView
    ) { 
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
    const optionscam: CameraOptions = {
      quality: 30,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.camera.getPicture(optionscam).then((imageData) => {
      this.presentLoading('Guardando Imagen');
      this.imagenPreview = this.webview.convertFileSrc(imageData); 
      console.log(this.consignacion.fecha);
      this._consigna.actualizaFotoConsignafirebase(this.idcs,this.consignacion.fecha, imageData).then(()=>{
        this.file.resolveLocalFilesystemUrl(imageData).then((fe:FileEntry)=>{
          fe.remove(function(){console.log("se elimino la foto")},function(){console.log("error al eliminar")});
        });
    });
     }, (err) => {console.log('Error en camara', JSON.stringify(err));});
  }
  seleccionarFoto(){
    const options = {  
      maximumImagesCount: 1,   
      quality: 50,
      outputType: 0
    };
    this.imagePicker.getPictures(options).then((image) => {
      this.presentLoading('Guardando Imagen');
      var imageData = image[0];
      this.imagenPreview =this.webview.convertFileSrc(imageData)  
      this._consigna.actualizaFotoConsignafirebase(this.idcs,this.consignacion.fecha, imageData).then(()=>{
          this.file.resolveLocalFilesystemUrl(imageData).then((fe:FileEntry)=>{
            fe.remove(function(){console.log("se elimino la foto")},function(){console.log("error al eliminar")});
          });
      });
    }, (err) => { console.log("error cargando imagenes", JSON.stringify(err));});
  }

  
  cerrarModal(){
    this.modalCtrl.dismiss();
  }
  

  }
