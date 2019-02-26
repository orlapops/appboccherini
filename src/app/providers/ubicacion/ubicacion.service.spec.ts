import { TestBed, inject } from '@angular/core/testing';

import { UbicacionProvider } from './ubicacion.service';

describe('UbicacionProvider', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UbicacionProvider]
    });
  });

  it('should be created', inject([UbicacionProvider], (service: UbicacionProvider) => {
    expect(service).toBeTruthy();
  }));
});
