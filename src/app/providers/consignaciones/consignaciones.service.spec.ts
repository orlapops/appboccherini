import { TestBed, inject } from '@angular/core/testing';

import { ConsignacionesService } from './consignaciones.service';

describe('ConsignacionesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConsignacionesService]
    });
  });

  it('should be created', inject([ConsignacionesService], (service: ConsignacionesService) => {
    expect(service).toBeTruthy();
  }));
});
