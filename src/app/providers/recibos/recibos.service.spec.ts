import { TestBed, inject } from '@angular/core/testing';

import { RecibosService } from './recibos.service';

describe('RecibosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecibosService]
    });
  });

  it('should be created', inject([RecibosService], (service: RecibosService) => {
    expect(service).toBeTruthy();
  }));
});
