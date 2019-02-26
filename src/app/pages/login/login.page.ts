import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { ParEmpreService } from '../../providers/par-empre.service';
import { AuthService } from '../../providers/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public onLoginForm: FormGroup;

  constructor(
    public _parEmpreProv: ParEmpreService,
    public auth : AuthService,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private translate: TranslateProvider,
    private formBuilder: FormBuilder
  ) { }

  
  
  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {
    // document.querySelector('video').play();
    if (this._parEmpreProv.datoslicencia.logeo_firebase){
      this.onLoginForm = this.formBuilder.group({
        'nit': [null, Validators.compose([
          Validators.required
        ])],
        'email': [null, Validators.compose([
          Validators.required
        ])],
        'password': [null, Validators.compose([
          Validators.required
        ])]
      });
    } else {
      this.onLoginForm = this.formBuilder.group({
        'nit': [null, Validators.compose([
          Validators.required
        ])],
        'password': [null, Validators.compose([
          Validators.required
        ])]
      });
  
  }
  }

  async forgotPass() {
    const alert = await this.alertCtrl.create({
      header: this.translate.get('app.pages.login.label.forgot'),
      message: this.translate.get('app.pages.login.text.forgot'),
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: this.translate.get('app.label.email')
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: async () => {
            const loader = await this.loadingCtrl.create({
              duration: 2000
            });

            loader.present();
            loader.onWillDismiss().then(async l => {
              const toast = await this.toastCtrl.create({
                showCloseButton: true,
                message: this.translate.get('app.pages.login.text.sended'),
                duration: 3000,
                position: 'bottom'
              });

              toast.present();
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // // //
  goToRegister() {
    // this.navCtrl.navigateRoot('/register');
    this.navCtrl.navigateRoot('/licencia');
  }

  goToHome() {
    this.navCtrl.navigateRoot('/home');
  }
  login(){
    this.presentLoading('Verificando');
    var tipologeo="N";
    this._parEmpreProv.reg_log('Login', 'login 1');
    if (this._parEmpreProv.datoslicencia.logeo_firebase){
      tipologeo='F';
    }
    
    this._parEmpreProv.verificausuarioNetsolin(this.onLoginForm.get('nit').value, this.onLoginForm.get('password').value, tipologeo)
    .then(()=>{ 
      this._parEmpreProv.reg_log('Login', 'login 2 verificado en netsolin');
      if (this._parEmpreProv.usuario_valido){
        this._parEmpreProv.reg_log('Login 3 usuario valido:', 'this._parEmpreProv.usuario');
        console.log('Login 3 usuario valido:', this._parEmpreProv.usuario);
        this._parEmpreProv.guardarUsuarioStorage().then(()=>{
        if (this._parEmpreProv.datoslicencia.logeo_firebase){
          this._parEmpreProv.reg_log('Login', 'login 4 legeo por firebase');
          this.auth.loginUser(this.onLoginForm.get('email').value, this.onLoginForm.get('password').value ).then((user) => {
            this._parEmpreProv.reg_log('Login', 'login 5');
            this.navCtrl.navigateRoot('/home');
            // this.navCtrl.setRoot( HomePage );
            this._parEmpreProv.cargarUsuarioStorage();
            this._parEmpreProv.reg_log('Login', 'login 6 logeo en firebase');
            console.log('Se logeo ok en firebase');
          })
         .catch(err=>{
          this._parEmpreProv.reg_log('Login', 'login 7 error: ' + err.message);
          let alert = this.alertCtrl.create({
              header: 'Error',
              subHeader: 'Debe ingresar usuario valido',
              message: err.message,
            buttons: ['Aceptar']
            }).then(alert => alert.present());
          })    
        } else {
          this._parEmpreProv.reg_log('Login', 'login 8 redirec home');
          this.navCtrl.navigateRoot('/home');
          // this.navCtrl.setRoot( HomePage );
          this._parEmpreProv.cargarUsuarioStorage();
          console.log('Se logeo ok en NETSOLIN');
        }
      })
      .catch(error=>{
        this._parEmpreProv.reg_log('Login error guardando usuario', error.message);
        console.log('Login error guardando usuario', error);

      });
      } else{
        this._parEmpreProv.reg_log('Login', 'login 9 error:' + this._parEmpreProv.menerror_usuar);
        let alert = this.alertCtrl.create({
          header: 'Error',
          subHeader: 'Debe ingresar usuario valido',
          message:this._parEmpreProv.menerror_usuar,
          buttons: ['Aceptar']
        }).then(alert => alert.present());
      }
    })
 }
  //Registrar usuario en firebase con correo y clave
  signin(){
    //antes de registrar en firebase debe existir como cliente o usuario en Netsolin
    this._parEmpreProv.verificausuarioNetsolin(this.onLoginForm.get('nit').value, this.onLoginForm.get('password').value, 'F')
    .then(()=>{ 
        if (this._parEmpreProv.usuario_valido){
          this._parEmpreProv.guardarUsuarioStorage()
          .then(() => {
          console.log('antes registrar en firebase');
          this.auth.registerUser(this.onLoginForm.get('email').value, this.onLoginForm.get('password').value)
            .then((user) => {
              // El usuario se ha creado correctamente
            })
            .catch(err=>{
              let alert = this.alertCtrl.create({
                header: 'Error',
                subHeader: 'Debe ingresar usuario valido',
                message: err.message,
              buttons: ['Aceptar']
              }).then(alert => alert.present());
          });
        });
        } else {
          let alert = this.alertCtrl.create({
            header: 'Error',
            subHeader: 'Debe ingresar usuario valido',
            message:this._parEmpreProv.menerror_usuar,
            buttons: ['Aceptar']
          }).then(alert => alert.present());
        }
   })
   .catch(err=>{
     console.log('catch error verifica usuario netsolin');
     console.log(err);
      let alert = this.alertCtrl.create({
        header: 'Error',
        subHeader: 'Debe ingresar usuario valido',
        message: err.message,
      buttons: ['Aceptar']
      }).then(alert => alert.present());
  })
}
async presentLoading(pmensaje) {
  const loading = await this.loadingCtrl.create({
    message: pmensaje,
    spinner: 'dots',
    duration: 1000
  });
  return await loading.present();
}

}
