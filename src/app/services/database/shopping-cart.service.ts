import { Injectable } from '@angular/core';
import { Firestore, runTransaction, Transaction } from '@angular/fire/firestore';
import { DbShoppingCart, DbShoppingCartProduct } from 'src/app/model/db-shopping-cart';
import { ShoppingCartProductService } from './shopping-cart-product.service';

import { map, Observable } from 'rxjs';
import { ShoppingCartData, ShoppingCartProducts } from 'src/app/model/shopping-cart';
import { AbstractCrudService } from './abstract-crud.service';

/** Contains the shoppingCartId and the ids of all contained products. */
export type ShoppingCartIdsType = { shoppingCartId: string, productIds: string[] };

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService extends AbstractCrudService<DbShoppingCart> {

  /** The current shoppingCartId */
  shoppingCartId: string;

  /** Observable for changes to the shoppingCart. */
  shoppingCart$: Observable<DbShoppingCart | null>;
  /** Observable for changes to the shoppingCartProducts. Replays the last
  *  emitted item on subscription. */
  public shoppingCartProducts$: Observable<ShoppingCartProducts<DbShoppingCartProduct>>;

  public shoppingCartProductService!: ShoppingCartProductService;

  constructor(
    firestore: Firestore
  ) {
    super('shopping-carts', firestore);

    this.shoppingCartId = this.getDefaultShoppingCartId();
    this.shoppingCartProductService = new ShoppingCartProductService(this.shoppingCartId, this.firestore);

    this.shoppingCartProducts$ = this.shoppingCartProductService.getAll()
      .pipe(
        map(shoppingCartProducts => new ShoppingCartProducts(shoppingCartProducts))
      )

    this.shoppingCart$ = this.get(this.shoppingCartId);
  }

  /**
   * This id is bound to the localStorage of the browser, therefore each browser
   * can only have at most one default shopping cart.
   *
   * @returns The shoppingCartId saved in the localStorage or create a new
   * unique shoppingCartId and save that in localStorage.
   */
  getDefaultShoppingCartId(): string {
    let shoppingCartId = localStorage.getItem('shoppingCartId');
    if (!shoppingCartId) {
      shoppingCartId = this.nextShoppingCartId();
    }
    return shoppingCartId;
  }

  nextShoppingCartId(): string {
    let shoppingCartId = AbstractCrudService.getUniqueId();
    localStorage.setItem('shoppingCartId', shoppingCartId);
    return shoppingCartId;
  }

  /**
   * This method also creates and deletes shopping carts and product entries within shopping carts.
   *
   * count > 0 and no shopping cart? Create a shopping cart with the shoppingCartId and add the product.
   *
   * Product count in shopping cart === 0 ? delete this product from the shopping cart.
   *
   * Shopping cart has no products at all anymore? delete this shopping cart from the array of shopping carts.
   *
   * @param product The shoppingCartProduct-data itself. Contains the current count.
   * @returns A promise that resolves when the process has finished.
   */
  async handleShoppingCartProduct(product: DbShoppingCartProduct) {
    let shoppingCartProductIds = await this.shoppingCartProductService.getIds();

    await runTransaction(this.firestore, async (transaction) => {

      if (shoppingCartProductIds.length == 0) {

        if (product.count > 0)
          await this.newShoppingCart(transaction, product);

      } else {

        if (product.count > 0) {
          this.updateShoppingCartProduct(transaction, product);
        } else {
          this.removeProduct(transaction, shoppingCartProductIds, product.id, this.shoppingCartId);
        }

      }
    });
  }

  private async newShoppingCart(transaction: Transaction, product: DbShoppingCartProduct) {
    await this.getOrCreateT(transaction, new ShoppingCartData(this.shoppingCartId));
    this.shoppingCartProductService.createT(transaction, product);
  }

  private updateShoppingCart(transaction: Transaction, shoppingCart: DbShoppingCart) {
    this.updateT(transaction, shoppingCart);
  }

  private updateShoppingCartProduct(transaction: Transaction, product: DbShoppingCartProduct) {
    this.shoppingCartProductService.createT(transaction, product);
  }

  private removeProduct(transaction: Transaction, productIds: string[], productId: string, shoppingCartId: string): boolean {
    (new ShoppingCartProductService(shoppingCartId, this.firestore)).deleteT(transaction, productId);

    if ((productIds.filter(id => id != productId)).length === 0) {
      this.deleteT(transaction, shoppingCartId);
      return true;
    }

    return false;
  }

  async deleteShoppingCart() {
    const ids = await this.shoppingCartProductService.getIds();

    await runTransaction(this.firestore, async (transaction) => this.deleteShoppingCartT(transaction, ids));
  }

  async deleteShoppingCartT(transaction: Transaction, ids: string[]) {
    this.shoppingCartProductService.deleteAllT(transaction, ids);
    this.deleteT(transaction, this.shoppingCartId);
  }

  /**
   * Get an array of all shoppingCartIds including all their product ids each.
   *
   * @returns An array of object containing shoppingCartId and an array
   *          of its productIds.
   */
  async getAllShoppingCartAndProductIds(): Promise<ShoppingCartIdsType[]> {
    const shoppingCartIds = await this.getIds();
    return await Promise.all(shoppingCartIds.map(async shoppingCartId => {

      const productIds = await new ShoppingCartProductService(shoppingCartId, this.firestore).getIds();

      return {
        shoppingCartId: shoppingCartId,
        productIds: productIds
      };

    }));
  }

  /**
   * Remove a product from all shopping carts.
   *
   * @param transaction The current transaction.
   * @param shoppingCartAndProductIds Array with id information about all shopping carts.
   * @param productId Id of the product to remove.
   *
   * @see getAllShoppingCartAndProductIds
   */
  removeProductFromAllCartsT(transaction: Transaction, shoppingCartAndProductIds: ShoppingCartIdsType[], productId: string) {
    shoppingCartAndProductIds.forEach(entry =>
      this.removeProduct(transaction, entry.productIds, productId, entry.shoppingCartId)
    );
  }

}
