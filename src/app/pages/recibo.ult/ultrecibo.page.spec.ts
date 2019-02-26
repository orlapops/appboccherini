import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UltReciboPage } from './ultrecibo.page';

describe('UltReciboPage', () => {
  let component: UltReciboPage;
  let fixture: ComponentFixture<UltReciboPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UltReciboPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UltReciboPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
