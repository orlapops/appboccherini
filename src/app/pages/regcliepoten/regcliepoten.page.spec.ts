import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegCliepotenPage } from './regcliepoten.page';

describe('RegCliepotenPage', () => {
  let component: RegCliepotenPage;
  let fixture: ComponentFixture<RegCliepotenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegCliepotenPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegCliepotenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
