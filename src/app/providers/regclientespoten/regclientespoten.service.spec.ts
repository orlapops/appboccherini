import { TestBed, inject } from '@angular/core/testing';

import { RegClientespotenService } from './regclientespoten.service';

describe('RegClientespotenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegClientespotenService]
    });
  });

  it('should be created', inject([RegClientespotenService], (service: RegClientespotenService) => {
    expect(service).toBeTruthy();
  }));
});
