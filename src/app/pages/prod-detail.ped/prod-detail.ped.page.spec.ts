import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdDetailPedPage } from './prod-detail.ped.page';

describe('ProdDetailPedPage', () => {
  let component: ProdDetailPedPage;
  let fixture: ComponentFixture<ProdDetailPedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProdDetailPedPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdDetailPedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
