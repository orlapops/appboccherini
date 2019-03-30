import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientepotenPage } from './clientespoten.page';

describe('ClientepotenPage', () => {
  let component: ClientepotenPage;
  let fixture: ComponentFixture<ClientepotenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientepotenPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientepotenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});

