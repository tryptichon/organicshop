import { Injectable } from '@angular/core';
import { Firestore, runTransaction, Transaction } from '@angular/fire/firestore';
import { DbShoppingCart, DbShoppingCartProduct } from 'src/app/model/db-shopping-cart';
import { ShoppingCartProductService } from './shopping-cart-product.service';

import { firstValueFrom, ReplaySubject, Subscription, take } from 'rxjs';
import { ShoppingCartProduct } from 'src/app/model/shopping-cart';
import { ShoppingCartProducts } from 'src/app/model/shopping-cart-products';
import { AbstractCrudService } from './abstract-crud.service';


@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService extends AbstractCrudService<DbShoppingCart> {

  /** The current shoppingCartId */
  shoppingCartId: string;

  /** Observable for changes to the shoppingCart. Replays the last
   *  emitted item on subscription. */
  shoppingCart$ = new ReplaySubject<DbShoppingCart | null>(1);
  /** Observable for changes to the shoppingCartProducts. Replays the last
  *  emitted item on subscription. */
  shoppingCartProducts$ = new ReplaySubject<ShoppingCartProducts>(1);

  public shoppingCartProductService!: ShoppingCartProductService;

  private shoppingCartSubscription?: Subscription;
  private shoppingCartProductsSubscription?: Subscription;

  constructor(
    firestore: Firestore
  ) {
    super('shopping-carts', firestore);
    this.shoppingCartId = this.getDefaultShoppingCartId();
    this.changeShoppingCart(this.shoppingCartId);
  }

  changeShoppingCart(shoppingCartId: string) {
    this.shoppingCartId = shoppingCartId;
    this.shoppingCartProductService = new ShoppingCartProductService(shoppingCartId, this.firestore);

    if (this.shoppingCartProductsSubscription)
      this.shoppingCartProductsSubscription.unsubscribe();

    this.shoppingCartProductsSubscription = this.shoppingCartProductService.getAll()
      .subscribe(shoppingCartProducts => {
        if (shoppingCartProducts)
          this.shoppingCartProducts$.next(new ShoppingCartProducts(shoppingCartProducts));
      });

    if (this.shoppingCartSubscription)
      this.shoppingCartSubscription.unsubscribe();

    this.shoppingCartSubscription = this.get(shoppingCartId)
      .subscribe(shoppingCart => {
        if (shoppingCart)
          this.shoppingCart$.next(shoppingCart);
      });
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
    let shoppingCartId = super.getUniqueId();
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
   * @param productId The id of the product.
   * @param product The shoppingCartProduct-data itself. Contains the current count.
   * @returns A promise that resolves when the process has finished.
   */
  async handleShoppingCartProduct(productId: string, product: ShoppingCartProduct) {
    let shoppingCartRemoved = false;

    let shoppingCartProductIds = (await firstValueFrom(this.shoppingCartProductService.getAll()
      .pipe(
        take(1)
      )))
      .map(product => product.id);

    await runTransaction(this.firestore, async (transaction) => {

      if (shoppingCartProductIds.length == 0) {

        if (product.count > 0)
          await this.newShoppingCart(transaction, productId, product);

      } else {

        if (product.count > 0) {
          this.updateShoppingCartProduct(transaction, productId, product);
        } else {
          shoppingCartRemoved = this.removeProduct(transaction, shoppingCartProductIds, productId, this.shoppingCartId);
        }

      }
    });

    if (shoppingCartRemoved)
      this.broadcastEmptyShoppingCart();

  }

  private createShoppingCart(): DbShoppingCart {
    return {
      id: this.shoppingCartId,
      dateCreated: new Date().getTime(),
    };
  }

  private createShoppingCartProduct(productId: string, product: ShoppingCartProduct): DbShoppingCartProduct {
    return {
      id: productId,
      ...product
    };
  }

  private async newShoppingCart(transaction: Transaction, productId: string, product: ShoppingCartProduct) {
    await this.getOrCreateT(transaction, this.createShoppingCart());
    this.shoppingCartProductService.createT(transaction, this.createShoppingCartProduct(productId, product));
  }

  private updateShoppingCart(transaction: Transaction, shoppingCart: DbShoppingCart) {
    this.updateT(transaction, shoppingCart);
  }

  private updateShoppingCartProduct(transaction: Transaction, productId: string, product: ShoppingCartProduct) {
    this.shoppingCartProductService.createT(transaction, this.createShoppingCartProduct(
      productId,
      product
    ));
  }

  removeProduct(transaction: Transaction, productIds: string[], productId: string, shoppingCartId: string): boolean {
    (new ShoppingCartProductService(shoppingCartId, this.firestore)).deleteT(transaction, productId);

    if ((productIds.filter(id => id != productId)).length === 0) {
      this.deleteT(transaction, shoppingCartId);
      return true;
    }

    return false;
  }

  async deleteShoppingCart() {
    let ids = await this.shoppingCartProductService.getIds();

    await runTransaction(this.firestore, async (transaction) => this.deleteShoppingCartT(transaction, ids));

    this.broadcastEmptyShoppingCart();
  }

  async deleteShoppingCartT(transaction: Transaction, ids: string[]) {
    this.shoppingCartProductService.deleteAllT(transaction, ids);
    this.deleteT(transaction, this.shoppingCartId);
  }

  broadcastEmptyShoppingCart() {
    this.shoppingCart$.next(null);
  }

  // /**
  //  * Remove a product from all shopping carts.
  //  *
  //  * @param productId The productId of the product to remove.
  //  * @returns A promise that completes when the process has finished.
  //  */
  // async removeProductFromAllCarts(productId: string) {
  //   let shoppingCartIds = await this.getIds();
  //   let products = await Promise.all(shoppingCartIds.map(async shoppingCartId => {
  //     const service = new ShoppingCartProductService(shoppingCartId, this.firestore);
  //     const productIds = (await firstValueFrom(service.getAll().pipe(take(1)))).map(product => product.id);
  //     return {
  //       shoppingCartId: shoppingCartId,
  //       service: service,
  //       productIds: productIds
  //     };
  //   }));

  //   await runTransaction(this.firestore, async (transaction) => {
  //     products.forEach(product => {
  //       this.removeProduct(transaction, product.productIds, productId, product.service, product.shoppingCartId)
  //     });
  //   });
  // }

}
