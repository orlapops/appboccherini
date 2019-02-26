import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy, Routes } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AgmCoreModule } from '@agm/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { TranslateProvider } from './providers';
// Modal Pages
import { ImagePageModule } from './pages/modal/image/image.module';
import { LocationPageModule } from './pages/modal/location/location.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { ParEmpreService } from './providers/par-empre.service';
import { AuthService } from './providers/auth.service';
import { VisitasProvider } from './providers/visitas/visitas.service';
// import { VisitaitemComponent } from './netsolinlibrerias/visitaitem/visitaitem.component';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { CarritoFacturaService } from './providers/carrito.factura.service';
import { ClienteProvider } from './providers/cliente.service';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { ModalActClientePageModule } from './pages/modal/modal-actcliente/modal-actcliente.module';
import { UbicacionProvider } from './providers/ubicacion/ubicacion.service';
import { ActividadesService } from './providers/actividades/actividades.service';
import { MessageService } from './providers/message/message.service';
// import { ModalActClientePageModule } from './pages/modal/modal-actcliente/modal-actcliente';
// import { VisitanService } from './providers/visitan.service';
// import { Network } from '@ionic-native/network';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent,
    // VisitaitemComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(environment.config),
    AppRoutingModule,
    HttpClientModule,
    ImagePageModule,
    LocationPageModule,
    ModalActClientePageModule,
    AngularFireModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    IonicStorageModule.forRoot(),
    // IonicStorageModule.forRoot({
    //   name: '__netsolinapp',
    //   driverOrder: ['indexeddb', 'sqlite', 'websql']
    // }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  
    AgmCoreModule.forRoot({
      // apiKey: 'AIzaSyD9BxeSvt3u--Oj-_GD-qG2nPr1uODrR0Y'
      apiKey: 'AIzaSyBCxuyq-qQPZFoWSc7UYY1uCznmZnjfqGI'
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthService,
    ParEmpreService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    TranslateProvider,
    Geolocation,
    Camera,
    BluetoothSerial,
    VisitasProvider,
    UbicacionProvider,
    ActividadesService,
    MessageService,
    // VisitanService,
    ClienteProvider,
    CarritoFacturaService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
