import { Firestore } from '@angular/fire/firestore';
import { DbShoppingCart } from './../../model/db-shopping-cart';
import { Injectable } from '@angular/core';
import { AbstractCrudService } from './abstract-crud.service';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService extends AbstractCrudService<DbShoppingCart>{

  constructor(firestore: Firestore) {
    super('shopping-cart', firestore);
  }

  /**
   * @returns The shoppingCartId saved in the localStorage or create a new
   * unique shoppingCartId and save that in localStorage.
   */
  override getUniqueId() : string {
    let shoppingCartId = localStorage.getItem('shoppingCartId');
    if (!shoppingCartId) {
      shoppingCartId = super.getUniqueId();
      localStorage.setItem('shoppingCartId', shoppingCartId);
    }
    return shoppingCartId;
  }

}
