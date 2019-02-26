import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../providers/message/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
  messages: Array<any> = [];
  cargo_mensajes = false;
  error_cargamensajes = false;
  constructor(public messageService: MessageService) { }

  ngOnInit() {
    console.log('ngOnInit mensajes 1');
    this.messageService.getdbDbmensajes()
      .subscribe((datosv: any)  => {
        console.log('ngOnInit mensajes datosv:', datosv);
        if ( datosv.length > 0) {
              let itemdato = datosv[0];
              // console.log(itemdato);
              // console.log(itemdato.payload);
              // console.log(itemdato.payload.doc);
              // console.log(itemdato.payload.doc.data());
              // console.log(itemdato.payload.doc.id);
              this.cargo_mensajes = true;
              this.error_cargamensajes = false;
          //    this.visitaTodas = datosv;
              this.messages = [];
              datosv.forEach((visiData: any) => {
                this.messages.push({
                  id: visiData.payload.doc.id,
                  data: visiData.payload.doc.data()
                });
              });
              console.log('Todos los mensajes con id');
          } else {
            this.cargo_mensajes = false;
            this.error_cargamensajes = false;
            this.messages = [];
          }
      });
  }

  deleteItem(message) {
    this.messageService.BorrarMensaje(message.id);
  }
}
