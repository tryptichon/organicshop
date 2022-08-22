import { Firestore } from '@angular/fire/firestore';
import { DbShoppingCartProduct } from 'src/app/model/shopping-cart';
import { AbstractCrudService } from './abstract-crud.service';

export class ShoppingCartProductService extends AbstractCrudService<DbShoppingCartProduct> {

  constructor(
    firestore: Firestore
  ) {
    super('shopping-cart-products', firestore);
  }
}
