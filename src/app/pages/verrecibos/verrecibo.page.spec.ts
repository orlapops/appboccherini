import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerreciboPage } from './verrecibo.page';

describe('RegVerreciboPage', () => {
  let component: VerreciboPage;
  let fixture: ComponentFixture<VerreciboPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerreciboPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerreciboPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
