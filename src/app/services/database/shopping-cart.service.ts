import { ShoppingCartProductService } from './shopping-cart-product.service';
import { Injectable } from '@angular/core';
import { Firestore, runTransaction, Transaction } from '@angular/fire/firestore';
import { DbShoppingCart, DbShoppingCartProduct } from 'src/app/model/db-shopping-cart';

import { AbstractCrudService } from './abstract-crud.service';
import { firstValueFrom, ReplaySubject, Subscription, switchMap, take, of, tap } from 'rxjs';
import { ShoppingCartProducts } from 'src/app/model/shopping-cart-products';
import { DialogHandler } from 'src/app/app-components/dialogs/DialogHandler';
import { ShoppingCartProduct } from 'src/app/model/shopping-cart';


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
    firestore: Firestore,
    private dialogs: DialogHandler,
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

    await runTransaction(this.firestore, async (transaction) => {

      let shoppingCartProducts = await firstValueFrom(this.shoppingCartProductService.getAll()
        .pipe(
          take(1)
        ));

      if (shoppingCartProducts.length == 0) {

        if (product.count > 0) {
          await this.newShoppingCart(transaction, productId, product);
        } else {
          return of();
        }

      } else {

        if (product.count > 0) {
          return this.updateShoppingCartProduct(transaction, productId, product);
        } else {
          shoppingCartRemoved = this.removeProduct(transaction, this.shoppingCartProductService, shoppingCartProducts, this.shoppingCartId, productId);
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
    try {
      await this.getOrCreateT(transaction, this.createShoppingCart());
      this.shoppingCartProductService.createT(transaction, this.createShoppingCartProduct(productId, product));
    } catch (error) {
      this.dialogs.error({ title: 'New Shopping Cart Communication Error', message: error });
    }
  }

  private updateShoppingCart(transaction: Transaction, shoppingCart: DbShoppingCart) {
    try {
      this.updateT(transaction, shoppingCart);
    } catch (error) {
      this.dialogs.error({ title: 'Update Shopping Cart Communication Error', message: error });
    }
  }

  private updateShoppingCartProduct(transaction: Transaction, productId: string, product: ShoppingCartProduct) {
    try {
      this.shoppingCartProductService.createT(transaction, this.createShoppingCartProduct(
        productId,
        product
      ));

    } catch (error) {
      this.dialogs.error({ title: 'Update Shopping Cart Product Communication Error', message: error });
    }
  }

  private removeProduct(transaction: Transaction, shoppingCartProductService: ShoppingCartProductService, products: DbShoppingCartProduct[], shoppingCartId: string, productId: string): boolean {
    try {
      shoppingCartProductService.deleteT(transaction, productId);

      if ((products.filter(product => product.id != productId)).length === 0) {
        this.deleteT(transaction, shoppingCartId);
        return true;
      }

    } catch (error) {
      this.dialogs.error({ title: 'Remove Product from Shopping Cart Communication Error', message: error });
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

  /**
   * Remove a product from all shopping carts.
   *
   * @param productId The productId of the product to remove.
   * @returns A promise that completes when the process has finished.
   */
  async removeProductFromAllCarts(productId: string) {
    await runTransaction(this.firestore, (transaction) => this.removeProductFromAllCartsT(transaction, productId));
  }

  async removeProductFromAllCartsT(transaction: Transaction, productId: string) {
    let shoppingCarts = await firstValueFrom(this.getAll()
      .pipe(
        take(1)
      ));

    shoppingCarts.forEach(async shoppingCart => {
      let shoppingCartProductService = new ShoppingCartProductService(shoppingCart.id, this.firestore);

      let products = await firstValueFrom(shoppingCartProductService.getAll()
        .pipe(
          take(1)
        ));

      this.removeProduct(transaction, shoppingCartProductService, products, shoppingCart.id, productId);
    });

  }

}


