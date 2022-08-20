import { DbShoppingCart } from './../model/db-shopping-cart';
import { Injectable, OnDestroy } from '@angular/core';
import { ShoppingCartService } from './database/shopping-cart.service';
import { filter, firstValueFrom, Observable, Subscription, take } from 'rxjs'
import { throwToolbarMixedModesError } from '@angular/material/toolbar';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartHandlerService implements OnDestroy {

  shoppingCartId: string;

  shoppingCartsSubscription?: Subscription;

  shoppingCarts = new Map<string, DbShoppingCart>();

  constructor(
    private shoppingCartService: ShoppingCartService
  ) {
    this.shoppingCartId = shoppingCartService.getUniqueId();

    this.shoppingCartsSubscription = shoppingCartService.getDocuments$()
      .subscribe(shoppingCarts => {
        this.shoppingCarts.clear();
        shoppingCarts.forEach(shoppingCart => this.shoppingCarts.set(shoppingCart.id, shoppingCart));
      });
  }

  ngOnDestroy(): void {
    if (this.shoppingCartsSubscription)
      this.shoppingCartsSubscription.unsubscribe();
  }

  private createShoppingCart(initialProducts?: { [id: string]: number }): DbShoppingCart {
    return {
      id: this.shoppingCartId,
      dateCreated: new Date().getTime(),
      dateOrdered: null,
      userId: null,
      products: initialProducts || {}
    };
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
   * @param productId The id of the product to change.
   * @param count The amount of this product
   * @returns A promise that resolves when the process has finished.
   */
  async setShoppingCartProduct(productId: string, count: number) {
    let shoppingCart: DbShoppingCart | undefined | void = this.shoppingCarts.get(this.shoppingCartId);

    if (!shoppingCart && count > 0) {
      shoppingCart = await firstValueFrom(
        this.shoppingCartService.getOrCreate(this.createShoppingCart({ [productId]: count }))
      )
      if (shoppingCart)
        this.shoppingCarts.set(shoppingCart.id, shoppingCart);

      return;
    }

    if (!shoppingCart)
      return;

    if (count > 0) {

      shoppingCart.products[productId] = count;

      await this.shoppingCartService.update(shoppingCart)
      this.shoppingCarts.set(shoppingCart.id, shoppingCart);

    } else {

      delete shoppingCart.products[productId];

      if (Object.keys(shoppingCart.products).length === 0) {
        await this.shoppingCartService.delete(shoppingCart.id)
        this.shoppingCarts.delete(shoppingCart.id);
      } else {
        await this.shoppingCartService.update(shoppingCart);
      }

    }
  }

}
