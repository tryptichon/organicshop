import { Injectable } from '@angular/core';
import { Firestore, runTransaction } from '@angular/fire/firestore';
import { ShoppingCartService } from 'src/app/services/database/shopping-cart.service';

import { firstValueFrom, take } from 'rxjs';
import { DbProduct } from './../../model/db-product';
import { AbstractCrudService } from './abstract-crud.service';
import { ShoppingCartProductService } from './shopping-cart-product.service';

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
    let shoppingCartIds = await this.shoppingCartService.getIds();
    let productInfos = await Promise.all(shoppingCartIds.map(async shoppingCartId => {
      const productIds = (await firstValueFrom(
        (new ShoppingCartProductService(shoppingCartId, this.firestore)).getAll().pipe(take(1))
      )).map(product => product.id);
      return {
        shoppingCartId: shoppingCartId,
        productIds: productIds
      };
    }));

    await runTransaction(this.firestore, async (transaction) => {
      this.deleteT(transaction, productId);
      productInfos.forEach(productInfo =>
        this.shoppingCartService.removeProduct(transaction, productInfo.productIds, productId, productInfo.shoppingCartId)
      );
    });
  }

}
