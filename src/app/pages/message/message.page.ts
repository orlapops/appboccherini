import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MessageService } from '../../providers/message/message.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
})
export class MessagePage implements OnInit {
  message: any;
  cargado = false;
  messageID: any = this.route.snapshot.paramMap.get('id');

  constructor(
    public route: ActivatedRoute,
    public messageService: MessageService
  ) { }

  ngOnInit() {
    this.messageService.getIdRegmensaje(this.messageID).subscribe((datos: any) => {
      console.log('constructor detalle mensajes getIdRegmensaje datos:', this.messageID, datos);                
      this.message = datos;
      this.cargado = true;
      //Actualizar como leido
      if (!datos.read) {
        const datactmsg = {
          fecha_leido : Date(),
          read : true
        };
        this.messageService.actualizarMensaje(this.messageID, datactmsg);
      }
  
      // this._visitas.visita_activa_copvdet = datos;
      // this.cargoVisitaActual = true;
      // this.message = this.messageService.getItem(this.messageID) ? this.messageService.getItem(this.messageID) : this.messageService.getMessages()[0];
    });
  }
}
