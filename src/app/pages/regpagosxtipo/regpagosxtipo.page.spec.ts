import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegPagosxtipoPage } from './regpagosxtipo.page';

describe('RegPagosxtipoPage', () => {
  let component: RegPagosxtipoPage;
  let fixture: ComponentFixture<RegPagosxtipoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegPagosxtipoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegPagosxtipoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
