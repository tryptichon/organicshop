import { LoginService } from './auth/login.service';
import { DbShoppingCart } from './../model/db-shopping-cart';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { ShoppingCartService } from './database/shopping-cart.service';
import { catchError, filter, firstValueFrom, Observable, of, Subscription, take, switchMap } from 'rxjs'
import { throwToolbarMixedModesError } from '@angular/material/toolbar';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartHandlerService {

  shoppingCartId: string;
  userId: string | null = null;

  shoppingCart: DbShoppingCart | null = null;

  constructor(
    private shoppingCartService: ShoppingCartService,
    private loginService: LoginService
  ) {
    this.shoppingCartId = shoppingCartService.getUniqueId();

    this.shoppingCartService.get(this.shoppingCartId)
      .subscribe(shoppingCart => {
        if (shoppingCart)
          this.shoppingCart = shoppingCart;
      });

    this.loginService.appUser$
      .pipe(
        switchMap(user => {
          this.userId = user ? user.id : null;
          return this.shoppingCartService.get(this.shoppingCartId);
        })
      )
      .subscribe(shoppingCart => {
        if (shoppingCart && shoppingCart.userId !== this.userId) {
          shoppingCart.userId = this.userId;
          this.updateShoppingCart(shoppingCart);
        }
      });

  }

  private createShoppingCart(initialProducts?: { [id: string]: number }): DbShoppingCart {
    return {
      id: this.shoppingCartId,
      dateCreated: new Date().getTime(),
      dateOrdered: null,
      userId: this.userId,
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
    let shoppingCart = this.shoppingCart;

    if (!shoppingCart) {

      if (count > 0)
        this.newShoppingCart(productId, count);

    } else {

      return (count > 0) ?
        this.setProductCount(shoppingCart, productId, count) :
        this.removeProductOrShoppingCart(shoppingCart, productId);

    }
  }

  private async newShoppingCart(productId: string, count: number) {
    try {
      let shoppingCart = await firstValueFrom(
        this.shoppingCartService.getOrCreate(this.createShoppingCart({ [productId]: count }))
      );
      if (shoppingCart)
        this.shoppingCart = shoppingCart;
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  private async setProductCount(shoppingCart: DbShoppingCart, productId: string, count: number) {
    shoppingCart.products[productId] = count;
    return this.updateShoppingCart(shoppingCart);
  }

  private async updateShoppingCart(shoppingCart: DbShoppingCart) {
    try {
      await this.shoppingCartService.update(shoppingCart);
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  private async removeProductOrShoppingCart(shoppingCart: DbShoppingCart, productId: string) {
    delete shoppingCart.products[productId];

    try {
      if (Object.keys(shoppingCart.products).length === 0) {
        await this.shoppingCartService.delete(shoppingCart.id);
        this.shoppingCart = null;
      } else {
        await this.shoppingCartService.update(shoppingCart);
      }
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

}
