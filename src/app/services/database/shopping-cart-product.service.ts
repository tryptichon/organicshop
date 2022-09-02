import { Firestore } from '@angular/fire/firestore';
import { DbShoppingCartProduct } from 'src/app/model/db-shopping-cart';

import { AbstractCrudService } from './abstract-crud.service';

export class ShoppingCartProductService extends AbstractCrudService<DbShoppingCartProduct> {

  constructor(
    shoppingCartId: string,
    firestore: Firestore
  ) {
    super('shopping-carts/' + shoppingCartId + '/products', firestore);
  }
}
