import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerpedidoPage } from './verpedido.page';

describe('RegVerpedidoPage', () => {
  let component: VerpedidoPage;
  let fixture: ComponentFixture<VerpedidoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerpedidoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerpedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
