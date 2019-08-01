import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, ToastController, ModalController, Platform, LoadingController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { ParEmpreService } from '../../providers/par-empre.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ConsignacionesService } from '../../providers/consignaciones/consignaciones.service';
import { ImagePage } from './../modal/image/image.page';
import { ModalActConsigPage } from '../modal/modal-actconsig/modal-actconsig.page';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File, DirectoryEntry, FileEntry } from "@ionic-native/file/ngx";

@Component({
  selector: 'app-consignacion',
  templateUrl: './consignar.page.html',
  styleUrls: ['./consignar.page.scss'],
})
export class ConsignarPage implements OnInit {
  formpagefec: Array<any> = [];
  formpagcheq: Array<any> = [];
  consignadas: Array<any> = [];
  ultconsigna: Array<any> = [];
  formaspago: Array<any> = [];
  cargoformpago = false;
  totefectivo = 0;
  totalcheques = 0;
  bancos: any;
  cargobancos = false;
  cta_banco = '';
  regconsig = {
    cta_banco: "",
    referencia: "",
    nota: "",
    valor: null,
    ajuste: null,
    cheques: [],
    valcheques: 0,
    link_imgfb: ""
  };

  grabando_consigna = false;
  grabo_consigna = false;
  mostrandoresulado = false;
  vistapagos: String = 'verefec';
  tomofoto: boolean = false;
  fototomada: any;
  imagenPreview: string = "";

  constructor(
    public _parEmpre: ParEmpreService,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public btCtrl: BluetoothSerial,
    private translate: TranslateProvider,
    public _visitas: VisitasProvider,
    public _cliente: ClienteProvider,
    public _consigna: ConsignacionesService,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public _DomSanitizer: DomSanitizer,
    private imagePicker: ImagePicker,
    private camera: Camera,
    private file: File,
    private webview: WebView
  ) {
    //cargar bancos de firebase
    this._parEmpre.getbancosFB().subscribe((datos: any) => {
      console.log("Cargo en bancos  de firebase datos", datos);
      this.bancos = datos;
      this.cargobancos = true;
    });
  }

  ngOnInit() {
    this.getFormPagodia().then(res => { });
    this.getUltConsignaPersona();
  }

  async actualizarFotoconsigna(idconsig) {
    const modal = await this.modalCtrl.create({
      component: ModalActConsigPage,
      componentProps: { idcs: idconsig }
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

  async presentError(pmensaje) {
    const alert2 = await this.alertCtrl.create({
      header: 'Error',
      message: pmensaje,
      buttons: ['Enterado'],
      cssClass: 'alerterror'
    });
    return await alert2.present();
  }

  getUltConsignaPersona() {
    return new Promise((resolve, reject) => {
      this._consigna.getUltConsignaPersona()
        .subscribe((datos: any) => {
          this.ultconsigna = [];
          datos.forEach((itemcons: any) => {
            this.ultconsigna.push({
              id: itemcons.payload.doc.id,
              data: itemcons.payload.doc.data()
            });
          });
          console.log("ultimas ", this.ultconsigna);
          return resolve(true);
        });
    });
  }
  getFormPagodia() {
    this.formaspago = [];
    return new Promise((resolve, reject) => {
      this._consigna.getFormPagodia()
        .subscribe((datos: any) => {
          console.log(datos);
          this.formpagefec = [];
          this.formpagcheq = [];
          this.totefectivo = 0;
          this.totalcheques = 0;
          this.formaspago = datos;
          this.cargoformpago = true;
          for (let item of this.formaspago) {

            if (item.formpago === 'EFE') {
              this.totefectivo += item.valor;
              this.formpagefec.push(item);
            } else if (item.formpago === "CHD") {
              this.totalcheques += item.valor;
              this.formpagcheq.push(item);
            }
          }
          return resolve(true);
        });
    });
  }

  realizar_consigna() {
    if (this._consigna.generando_consigna) {
      console.log('Ya se esta generando un pedido. Espere');
    }
    this.grabando_consigna = true;

    if (!this.regconsig.ajuste) {
      this.regconsig.ajuste = 0;
    }
    const obj_graba = {
      cta_banco: this.regconsig.cta_banco,
      fecha: new Date().toISOString(),
      referencia: this.regconsig.referencia,
      nota: this.regconsig.nota,
      valor: this.regconsig.valor,
      ajuste: this.regconsig.ajuste,
      cuentas: [],
      link_imgfb: this.regconsig.link_imgfb,
      efectivo: [],
      cheques: [],
    };
    var porasignar = this.regconsig.valor - this.regconsig.valcheques;
    var cuenta = 0;
    while (porasignar > 0) {
      if (this.formpagefec[cuenta].valor <= porasignar) {
        porasignar -= this.formpagefec[cuenta].valor;
        let objet = this.formpagefec[cuenta];
        objet.porcentaje = 100;
        objet.valorRestante = 0;
        obj_graba.cuentas.push(objet);
        obj_graba.efectivo.push(objet);
        cuenta++;
      }
      else {
        let objet = this.formpagefec[cuenta];
        console.log(objet);
        objet.porcentaje = (porasignar / objet.valor) * 100;
        console.log(objet);
        objet.valorRestante = objet.valor - porasignar;
        console.log(objet);
        obj_graba.cuentas.push(objet);
        objet.valor = porasignar
        obj_graba.efectivo.push(objet);
        porasignar = 0;
      }
    }
    this.regconsig.cheques.forEach(cqe => {
      let ob = this.formpagcheq[cqe];
      ob.porcentaje = 100;
      ob.valorRestante = 0;
      obj_graba.cuentas.push(ob);
      obj_graba.cheques.push(ob);
    })
    console.log(obj_graba);
    this._consigna.genera_consigna_netsolin(obj_graba, this.fototomada).then(res => {
      if (res) {
        this.mostrandoresulado = true;
        this.grabo_consigna = true;
        console.log('retorna genera_consigna_netsolin res:', res);

        obj_graba.cuentas.forEach(element => {
          let idcuen = element.cod_docume.trim() + element.num_docume.trim() + element.formpago.trim();
          let idcons = this._consigna.consig_grabada.cod_docume.trim() + this._consigna.consig_grabada.num_docume.trim();
          let objact = {
            porcentaje: element.porcentaje,
            cod_consig: this._consigna.consig_grabada.cod_docume,
            num_dconsig: this._consigna.consig_grabada.num_docume,
            nota: obj_graba.nota,
            fecha: element.fecha,
            cta_banco: obj_graba.cta_banco,
            referencia: obj_graba.referencia
          };
          let valorRestante = {
            valor: element.valorRestante
          };
          console.log(valorRestante);
          this._consigna.actcierre(idcuen, idcons, objact, valorRestante, element.fecha).then(res => {
            this.regconsig = {
              cta_banco: "",
              referencia: "",
              nota: "",
              valor: null,
              ajuste: null,
              cheques: [],
              valcheques: 0,
              link_imgfb: ""
            };
            this.tomofoto = false;
            this.fototomada = "";
            this.imagenPreview = "";
          });
        });
      } else {
        this.mostrandoresulado = true;
        this.grabo_consigna = false;
        this.grabando_consigna = true;
        console.log('retorna genera_consigna_netsolin error.message: ');
      }
    })
      .catch(error => {
        this.mostrandoresulado = true;
        this.grabo_consigna = false;
        this.grabando_consigna = true;
        console.log('retorna genera_consigna_netsolin error.message: ', error);
      });
  }

  quitar_resuladograboconsigna() {
    if (this.grabo_consigna) {
      this.grabo_consigna = false;
    }
    this.grabando_consigna = false;
    this.mostrandoresulado = false;
  }

  imprimir_consigna() {
    let printer;
    this.btCtrl.list().then(async datalist => {
      let sp = datalist;
      let input = [];
      sp.forEach(element => {
        let val = { name: element.id, type: 'radio', label: element.name, value: element };
        input.push(val);
      });
      const alert = await this.alertCtrl.create({
        header: 'Selecciona impresora',
        inputs: input,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {

            text: 'Ok',
            handler: (inpu) => {
              printer = inpu;
              console.log(inpu);
              const printing = this.btCtrl.connect(printer.id).subscribe(data => {
                this.btCtrl.connect(printer.id);
                this.btCtrl.write(this._consigna.consig_grabada.txt_imp).then(async msg => {
                  const alert2 = await this.alertCtrl.create({
                    message: 'Imprimiendo',
                    buttons: ['Cancel']
                  });
                  await alert2.present();
                }, async err => {
                  const alerter = await this.alertCtrl.create({
                    message: 'ERROR' + err,
                    buttons: ['Cancelar']
                  });
                  await alerter.present();
                });
              });
            }
          }
        ]
      });
      await alert.present();
    }, async err => {
      console.log('No se pudo conectar', err);
      const alert = await this.alertCtrl.create({
        message: 'ERROR' + err,
        buttons: ['Cancelar']
      });
      await alert.present();
    });

  }
  actCheques(e) {
    this.regconsig.valcheques = 0;
    e.detail.value.forEach(element => {
      this.regconsig.valcheques += this.formpagcheq[element].valor;
    });
  }
  mostrar_camara() {
    const optionscam: CameraOptions = {
      quality: 30,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.camera.getPicture(optionscam).then((imageData) => {
      this.presentLoading('Guardando Imagen');
      this.imagenPreview = this.webview.convertFileSrc(imageData);
      this.fototomada = imageData;
      this.tomofoto = true;
    }, (err) => { console.log('Error en camara', JSON.stringify(err)); });
  }
  seleccionarFoto() {
    const options = {
      maximumImagesCount: 1,
      quality: 25,
      outputType: 0
    };
    this.imagePicker.getPictures(options).then((image) => {
      this.presentLoading('Guardando Imagen seleccionar');
      var imageData = image[0];
      this.imagenPreview = this.webview.convertFileSrc(imageData)
      this.fototomada = imageData;
      this.tomofoto = true;
    }, (err) => { console.log("error cargando imagenes", JSON.stringify(err)); });
  }
}

