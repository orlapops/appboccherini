import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerfacturaPage } from './verfactura.page';

describe('RegVerfacturaPage', () => {
  let component: VerfacturaPage;
  let fixture: ComponentFixture<VerfacturaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerfacturaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerfacturaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
