import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReciboDetailPage } from './recibo-detail.page';

describe('ReciboDetailPage', () => {
  let component: ReciboDetailPage;
  let fixture: ComponentFixture<ReciboDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReciboDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReciboDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
