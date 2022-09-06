import { Injectable } from '@angular/core';
import { Firestore, runTransaction } from '@angular/fire/firestore';
import { ShoppingCartService } from 'src/app/services/database/shopping-cart.service';

import { DbProduct } from './../../model/db-product';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends AbstractCrudService<DbProduct> {

  constructor(
    private shoppingCartService: ShoppingCartService,
    firestore: Firestore
  ) {
    super('products', firestore);
  }

  /**
   * Remove a product and also remove it from all shopping carts.
   *
   * @param productId The productId of the product to remove.
   * @returns A promise that completes when the process has finished.
   */
  async removeProductFromAllCarts(productId: string) {
    let shoppingCartAndProductIds = await this.shoppingCartService.getAllShoppingCartAndProductIds();

    await runTransaction(this.firestore, async (transaction) => {
      this.deleteT(transaction, productId);
      this.shoppingCartService.removeProductFromAllCartsT(transaction, shoppingCartAndProductIds, productId);
    });
  }

}
