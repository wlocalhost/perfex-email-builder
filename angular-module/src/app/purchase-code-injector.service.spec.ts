import { TestBed } from '@angular/core/testing';

import { PurchaseCodeInjectorService } from './purchase-code-injector.service';

describe('PurchaseCodeInjectorService', () => {
  let service: PurchaseCodeInjectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseCodeInjectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
