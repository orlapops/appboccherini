import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActUbicacionPage } from './act.ubicacion.page';


describe('ActUbicacionPage', () => {
  let component: ActUbicacionPage;
  let fixture: ComponentFixture<ActUbicacionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActUbicacionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActUbicacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
