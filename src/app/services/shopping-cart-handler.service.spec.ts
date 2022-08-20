/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ShoppingCartHandlerService } from './shopping-cart-handler.service';

describe('Service: ShoppingCartHandler', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShoppingCartHandlerService]
    });
  });

  it('should ...', inject([ShoppingCartHandlerService], (service: ShoppingCartHandlerService) => {
    expect(service).toBeTruthy();
  }));
});
