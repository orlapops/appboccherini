import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UltPedidoPage } from './ultpedido.page';

describe('UltPedidoPage', () => {
  let component: UltPedidoPage;
  let fixture: ComponentFixture<UltPedidoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UltPedidoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UltPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
