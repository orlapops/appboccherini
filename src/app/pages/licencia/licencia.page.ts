import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, LoadingController } from '@ionic/angular';
import { AngularFireModule } from '@angular/fire';
import { AlertController } from '@ionic/angular';
import { ParEmpreService } from '../../providers/par-empre.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Component({
  selector: 'app-licencia',
  templateUrl: './licencia.page.html',
  styleUrls: ['./licencia.page.scss'],
})

export class LicenciaPage implements OnInit {
  public onRegisterForm: FormGroup;

  seguimiento = "";
  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private fbDbNets: AngularFirestore,    
    public _parEmpreProv: ParEmpreService,
    public alertCtrl: AlertController,
      ) {
        console.log('constructor licencia ');
        this.getconsultoresFBnetsolin()
        .subscribe( (data:any) =>{
          console.log('data leida consultores: ', data);
        });
       }
      ionViewWillEnter() {
        this.menuCtrl.enable(false);
      }
    
  ngOnInit() {
    this.onRegisterForm = this.formBuilder.group({
      'nitEmpre': [null, Validators.compose([
        Validators.required
      ])]
    });    
  }

    //Obtiene tipos consultores FB Netsolin
    public getconsultoresFBnetsolin() {
      return this.fbDbNets
        .collection("bancos")
        .valueChanges();
    }
  registrar(){
    console.log('evento registrar click');
    console.log(this.onRegisterForm.get('nitEmpre').value);
    this.seguimiento = 'A verificar licencia';
    this.presentLoading('Verificando');
    this._parEmpreProv.verificaLicencia(this.onRegisterForm.get('nitEmpre').value)
    .then(()=>{ 
        console.log('registrar licencia');
        console.log('licenValida');
        console.log(this._parEmpreProv.licenValida);
        if (this._parEmpreProv.licenValida){
          this.seguimiento = 'Licencia valida 0';
          //guardar datos licencia
          console.log(this._parEmpreProv.datoslicencia.apps);
          console.log(this._parEmpreProv.datoslicencia.url_publica);
          //si usa firebase incializar
          if (this._parEmpreProv.datoslicencia.util_firebase){
            console.log('utiliza firebase inicializar')
            AngularFireModule.initializeApp(this._parEmpreProv.datoslicencia.key_firebase);
            console.log('utiliza firebase inicializar 2')
          }
          this.seguimiento = 'Licencia valida 1';
          if (this._parEmpreProv.datoslicencia.apps && this._parEmpreProv.datoslicencia.url_publica){
            this.seguimiento = 'Licencia valida 2 guardar';
            this._parEmpreProv.guardarLicenciaStorage()
            this.seguimiento = 'Licencia valida 3';
            // this._ps.cargar_todos();
            // this._ps.cargar_lineas();
          if(this._parEmpreProv.datoslicencia.util_logeo){
              //cambiar a pagina de login          
              // this.navCtrl.setRoot( LoginPage );
              this.seguimiento = 'Licencia valida 4';
              this.navCtrl.navigateRoot('/login');
            } else {
              this.seguimiento = 'Licencia valida 5';
              this.navCtrl.navigateRoot('/home');
              // this.navCtrl.setRoot( HomePage );
            }
          } else {
            this.seguimiento = 'Licencia valida 6';
            this.alertCtrl.create({
              header:'Error',
              subHeader: 'Licencia Invalida',
              message: 'Contacte Administrador para validar licencia',
              buttons: ['Aceptar']
            }).then(alert => alert.present());
  
          }
        } else {
          this.alertCtrl.create({
            header:'Error',
            subHeader: 'Debe ingresar Nit valido',
            message: 'No se encontro licencia valida con este Nit',
            buttons: ['Aceptar']
          }).then(alert => alert.present());

        }
        console.log('datoslicencia');
        console.log(this._parEmpreProv.datoslicencia);
  })        

    // this.navCtrl.setRoot( HomePage );

  }
  async presentLoading(pmensaje) {
    const loading = await this.loadingCtrl.create({
      message: pmensaje,
      spinner: 'dots',
      duration: 2000
    });
    return await loading.present();
  }
}
