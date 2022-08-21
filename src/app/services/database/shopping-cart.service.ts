import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import { DbShoppingCart } from './../../model/db-shopping-cart';
import { AbstractCrudService } from './abstract-crud.service';


@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService extends AbstractCrudService<DbShoppingCart> {

  constructor(firestore: Firestore) {
    super('shopping-carts', firestore);
  }

  /**
   * This id is bound to the localStorage of the browser, therefore each browser
   * can only have at most one shopping cart.
   *
   * @returns The shoppingCartId saved in the localStorage or create a new
   * unique shoppingCartId and save that in localStorage.
   */
  override getUniqueId(): string {
    let shoppingCartId = localStorage.getItem('shoppingCartId');
    if (!shoppingCartId) {
      shoppingCartId = super.getUniqueId();
      localStorage.setItem('shoppingCartId', shoppingCartId);
    }
    return shoppingCartId;
  }

}


