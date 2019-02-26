import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UltFacturaPage } from './ultfactura.page';

describe('UltFacturaPage', () => {
  let component: UltFacturaPage;
  let fixture: ComponentFixture<UltFacturaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UltFacturaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UltFacturaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
