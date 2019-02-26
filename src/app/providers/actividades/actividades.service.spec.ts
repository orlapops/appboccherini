import { TestBed, inject } from '@angular/core/testing';

import { ActividadesService } from './actividades.service';

describe('ActividadesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActividadesService]
    });
  });

  it('should be created', inject([ActividadesService], (service: ActividadesService) => {
    expect(service).toBeTruthy();
  }));
});
