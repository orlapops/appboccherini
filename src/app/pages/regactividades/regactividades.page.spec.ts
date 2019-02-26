import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegActividadesPage } from './regactividades.page';

describe('RegActividadesPage', () => {
  let component: RegActividadesPage;
  let fixture: ComponentFixture<RegActividadesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegActividadesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegActividadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
