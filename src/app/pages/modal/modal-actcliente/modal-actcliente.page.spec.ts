import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalActClientePage } from './modal-actcliente.page';

describe('ModalActClientePage', () => {
  let component: ModalActClientePage;
  let fixture: ComponentFixture<ModalActClientePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalActClientePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalActClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
