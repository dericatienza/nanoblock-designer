import { TestBed, inject } from '@angular/core/testing';

import { BrickColorService } from './brick-color.service';

describe('BrickColorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrickColorService]
    });
  });

  it('should be created', inject([BrickColorService], (service: BrickColorService) => {
    expect(service).toBeTruthy();
  }));
});
