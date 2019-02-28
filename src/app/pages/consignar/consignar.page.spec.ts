import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignarPage } from './consignar.page';

describe('ConsignarPage', () => {
  let component: ConsignarPage;
  let fixture: ComponentFixture<ConsignarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsignarPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
