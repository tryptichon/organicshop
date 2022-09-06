import { TestBed } from '@angular/core/testing';

import { OrderSuccessResolver } from './order-success.resolver';

describe('OrderSuccessResolver', () => {
  let resolver: OrderSuccessResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(OrderSuccessResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
