import { ProductService } from './database/product.service';
import { Injectable } from '@angular/core';
import { firstValueFrom, map, Observable, Subject, switchMap } from 'rxjs';
import { DbShoppingCart } from './../model/db-shopping-cart';
import { LoginService } from './auth/login.service';
import { ShoppingCartService } from './database/shopping-cart.service';

/**
 * This service handles the shopping cart.
 */
@Injectable({
  providedIn: 'root'
})
export class ShoppingCartHandlerService {

  /** Observable for the current shopping cart of the shop. */
  shoppingCart$: Observable<DbShoppingCart | null>;
  /** Observable for the sum of all products in the shopping cart. */
  shoppingCartCount$ = new Subject<number | null>();


  /** This id is bound to a browser. */
  shoppingCartId: string;

  /** Will be set according to the current logged in user. */
  userId: string | null = null;

  /** Local copy of the current shopping cart. */
  private shoppingCart: DbShoppingCart | null = null;

  /**
   * This service handles the shopping cart.
   *
   * @param shoppingCartService The database backend for shopping cart data.
   * @param loginService To observe user login/logout.
   */
  constructor(
    private shoppingCartService: ShoppingCartService,
    private productService: ProductService,
    private loginService: LoginService
  ) {
    this.shoppingCartId = shoppingCartService.getUniqueId();
    this.shoppingCart$ = this.shoppingCartService.get(this.shoppingCartId).pipe(
      map(shoppingCart => shoppingCart || null)
    );

    this.shoppingCart$
      .subscribe(shoppingCart => {
        if (shoppingCart)
          this.shoppingCart = shoppingCart;
        this.shoppingCartCount$.next(this.productCount());
      });

    this.loginService.appUser$
      .pipe(
        switchMap(user => {
          this.userId = user ? user.id : null;
          return this.shoppingCart$;
        })
      )
      .subscribe(shoppingCart => {
        if (shoppingCart && shoppingCart.userId !== this.userId) {
          shoppingCart.userId = this.userId;
          this.updateShoppingCart(shoppingCart);
        }
      });

  }

  /**
   * @returns The sum of all products or null if no shopping cart exists.
   */
  productCount(): number | null {
    if (!this.shoppingCart)
      return null;

    let count: number = 0;
    Object.values(this.shoppingCart.products).forEach(amount => count += amount);
    return count;
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
  async handleShoppingCartProduct(productId: string, count: number) {
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

  private createShoppingCart(initialProducts?: { [id: string]: number }): DbShoppingCart {
    return {
      id: this.shoppingCartId,
      dateCreated: new Date().getTime(),
      dateOrdered: null,
      userId: this.userId,
      products: initialProducts || {}
    };
  }

  private async newShoppingCart(productId: string, count: number) {
    try {
      this.shoppingCart = await firstValueFrom(
        this.shoppingCartService.getOrCreate(
          this.createShoppingCart({ [productId]: count }))
      ) || null;

      this.shoppingCartCount$.next(count);
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
      this.shoppingCartCount$.next(this.productCount());
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

      this.shoppingCartCount$.next(this.productCount());
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

}
