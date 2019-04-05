import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalActConsigPage } from './modal-actconsig.page';

describe('ModalActConsigPage', () => {
  let component: ModalActConsigPage;
  let fixture: ComponentFixture<ModalActConsigPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalActConsigPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalActConsigPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
