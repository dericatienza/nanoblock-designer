import { TestBed, inject } from '@angular/core/testing';

import { BrickTypeService } from './brick-type.service';

describe('BrickTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrickTypeService]
    });
  });

  it('should be created', inject([BrickTypeService], (service: BrickTypeService) => {
    expect(service).toBeTruthy();
  }));
});
