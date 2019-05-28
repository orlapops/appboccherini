import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesListPage } from './clientes-list.page';

describe('ClientesListPage', () => {
  let component: ClientesListPage;
  let fixture: ComponentFixture<ClientesListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientesListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
