import { Component, OnInit } from '@angular/core';
import { RegClientespotenService } from "../../providers/regclientespoten/regclientespoten.service";

@Component({
  selector: 'app-clientespoten',
  templateUrl: './clientespoten.page.html',
  styleUrls: ['./clientespoten.page.scss'],
})
export class ClientepotenPage implements OnInit {
  clientespoten: Array<any> = [];
  cargo_clientespoten = false;
  error_cargaclientespoten = false;
  constructor(public _clienpotenService: RegClientespotenService) { }
  
  ngOnInit() {
    console.log('ngOnInit clientespoten 1');
    this._clienpotenService.getClientespotenusuar()
      .subscribe((datosc: any)  => {
        console.log('ngOnInit clientespoten datosv:', datosc);
        if ( datosc.length > 0) {
              let itemdato = datosc[0];
              // console.log(itemdato);
              // console.log(itemdato.payload);
              // console.log(itemdato.payload.doc);
              // console.log(itemdato.payload.doc.data());
              // console.log(itemdato.payload.doc.id);
              this.cargo_clientespoten = true;
              this.error_cargaclientespoten = false;
          //    this.visitaTodas = datosv;
              this.clientespoten = [];
              datosc.forEach((clientep: any) => {
                this.clientespoten.push({
                  id: clientep.payload.doc.id,
                  data: clientep.payload.doc.data()
                });
              });
              console.log('Todos los clientespoten con id');
          } else {
            this.cargo_clientespoten = false;
            this.error_cargaclientespoten = false;
            this.clientespoten = [];
          }
      });
  }

  deleteItem(clienpoten) {
    this._clienpotenService.BorrarClienpoten(clienpoten.id);
  }
}
