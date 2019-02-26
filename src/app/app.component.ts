import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { TranslateProvider } from './providers/translate/translate.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';

import { Pages } from './interfaces/pages';
import { ParEmpreService } from './providers/par-empre.service';
import { AuthService } from './providers/auth.service';
import { UbicacionProvider } from './providers/ubicacion/ubicacion.service';
import { expressionType } from '@angular/compiler/src/output/output_ast';
// import * as jstest from '../assets/js/netsolin.js'
// declare var testvar;
// declare var ePosDev = new epson.ePOSDevice();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public appPages: Array<Pages>;
  // public listing;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateProvider,
    private translateService: TranslateService,
    public _parEmpreProv: ParEmpreService,
    private auth: AuthService ,
    public ubicacionService: UbicacionProvider,
    public navCtrl: NavController
  ) {
    // console.log('vartext js: ' + testvar);
    // console.log(jsext_prueba('retornado por js'));
    this.appPages = [
      {
        title: 'Inicio',
        url: '/home',
        direct: 'root',
        icon: 'home'
      },
      // {
      //   title: 'Recibo Caja',
      //   url: '/recibocaja',
      //   direct: 'forward',
      //   icon: 'book'
      // },
      // {
      //   title: 'Factura',
      //   url: '/factura',
      //   direct: 'forward',
      //   icon: 'list'
      // },
      // {
      //   title: 'Rent a Car',
      //   url: '/rentcar',
      //   direct: 'forward',
      //   icon: 'car'
      // },
      // {
      //   title: 'Trip Activities',
      //   url: '/activities',
      //   direct: 'forward',
      //   icon: 'beer'
      // },
      // {
      //   title: 'Local Weather',
      //   url: '/local-weather',
      //   direct: 'forward',
      //   icon: 'partly-sunny'
      // },
      {
        title: 'Acerca de',
        url: '/about',
        direct: 'forward',
        icon: 'information-circle-outline'
      },
      {
        title: 'Soporte',
        url: '/support',
        direct: 'forward',
        icon: 'help-buoy'
      },
      {
        title: 'Configurar',
        url: '/settings',
        direct: 'forward',
        icon: 'settings'
      }
    ];

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      // Set language of the app.
      this.translateService.setDefaultLang(environment.language);
      this.translateService.use(environment.language);
      this.translateService.getTranslation(environment.language).subscribe(translations => {
        this.translate.setTranslations(translations);
      });
      this._parEmpreProv.cargarLicenciaStorage().then( existe => {  
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        //si existe contnua verificando parametros
        if ( existe ) {
              // this._parEmpreProv.reg_log('app.component cargo licencia url:', this._parEmpreProv.URL_SERVICIOS);
              console.log('cargo licencia this._parEmpreProv: '+ this._parEmpreProv);
              console.log('this._parEmpreProv.datoslicencia.url_publica: ', this._parEmpreProv.datoslicencia.url_publica);
              this._parEmpreProv.URL_SERVICIOS = this._parEmpreProv.datoslicencia.url_publica;
              console.log('cargo licencia URL_SERVICIOS: '+this._parEmpreProv.URL_SERVICIOS);
              //inicializar carga necesaria en home 
              // this._rs.cargaRutaActiva();
              // si debe pedir logeo 
              if (this._parEmpreProv.datoslicencia.util_logeo){
                if(this._parEmpreProv.datoslicencia.logeo_firebase){
                  // this._parEmpreProv.reg_log('logeo', 'app.component util logeo firebase');
                  console.log('app.component 3 util logeo');
                  //version con auth por firebase
                  this.auth.Session.subscribe(session=>{
                    // this._parEmpreProv.reg_log('app.component util logeo firebase 2 session:', session);
                    console.log('app.component 4 util logeo');
                    if(session){
                      // this._parEmpreProv.reg_log('logeo', 'app.component util logeo firebase 3');
                      console.log('app.component 5 util logeo cambiar a homepage');
                      this.navCtrl.navigateRoot('/tabs/(home:home)');
                    }
                    else{
                      // this._parEmpreProv.reg_log('logeo', 'app.component util logeo firebase 4 a pag logeo');
                      console.log('app.component 5 util logeo cambiar a loginpage');
                      this.navCtrl.navigateRoot('/login');
                    }
                  });
                  this.statusBar.styleDefault();
                  this.splashScreen.hide();  
                } else { 
                  //version sin auth por firebase

                  // this._parEmpreProv.reg_log('logeo sin fb', 'app.component util logeo sin firebase 1');
                  this._parEmpreProv.cargarUsuarioStorage().then( existe => {  
                    // this._parEmpreProv.reg_log('app.component util logeo sin firebase 2 existe:', existe);
                    console.log('app.component netsolin cargo storage 1');
                    //si existeno necesita volver a pedir logeo va a homepage sino a logeo
                    if ( existe ) {
                      // this._parEmpreProv.reg_log('logeo sfb existe', 'app.component util logeo sin firebase 3');
                      console.log('app.component netsolin cargo storage 3 a tabspage');
                      this.navCtrl.navigateRoot('/home');
                    }else {
                      // this._parEmpreProv.reg_log('logeo sfb no existe', 'app.component util logeo sin firebase 4 a pag login');
                      console.log('app.component netsolin cargo storage 4 a loginpage');
                      this.navCtrl.navigateRoot('/login');
                    }  
                    });
                  }                    
              } else {
                // this._parEmpreProv.reg_log('app.component NO util logeo 1', ' a home');
                console.log('No utiliza logeo');
                this.navCtrl.navigateRoot('/home');
            }
        }else {
          // this._parEmpreProv.reg_log('app.componentNO EXISTE LICENCIA', ' a root');
          console.log('No existe datos licencia ir a registrar licencia');
          this.navCtrl.navigateRoot('');
         }  
    });      
    }).catch(() => {
      // Set language of the app.
      this.translateService.setDefaultLang(environment.language);
      this.translateService.use(environment.language);
      this.translateService.getTranslation(environment.language).subscribe(translations => {
        this.translate.setTranslations(translations);
      });
    });
  }

  goToEditProgile() {
    this.navCtrl.navigateForward('edit-profile');
  }

  logout() {
    this.ubicacionService.detenerUbicacion();
    this.navCtrl.navigateRoot('login');
  }

}
