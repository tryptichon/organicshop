import { ShoppingCartProduct } from './../model/shopping-cart';
import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { firstValueFrom, map, Observable, of, Subject, switchMap } from 'rxjs';
import { DbShoppingCart, DbShoppingCartProduct, ShoppingCart } from '../model/shopping-cart';
import { LoginService } from './auth/login.service';
import { ShoppingCartProductService } from './database/shopping-cart-product.service';
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
  /** Observable for the products within the current shopping cart of the shop. */
  shoppingCartProducts$: Observable<DbShoppingCartProduct[]>;

  /** Observable for the sum of all products in the shopping cart. */
  shoppingCartCount$ = new Subject<number | null>();


  /** This id is bound to a browser. */
  shoppingCartId: string;

  /** Will be set according to the current logged in user. */
  userId: string | null = null;

  /** Local copy of the current shopping cart. */
  private shoppingCart: ShoppingCart | null = null;

  shoppingCartProductService!: ShoppingCartProductService

  /**
   * This service handles the shopping cart.
   *
   * @param shoppingCartService The database backend for shopping cart data.
   * @param loginService To observe user login/logout.
   */
  constructor(
    private shoppingCartService: ShoppingCartService,
    private loginService: LoginService,
    firestore: Firestore
  ) {
    this.shoppingCartId = shoppingCartService.getUniqueId();

    this.shoppingCartProductService = new ShoppingCartProductService(firestore);

    this.shoppingCart$ = this.shoppingCartService.get(this.shoppingCartId)
      .pipe(
        map(shoppingCart => shoppingCart || null)
      );

    this.shoppingCartProducts$ = this.shoppingCartProductService.getAll()
      .pipe(
        map(shoppingCartProducts => shoppingCartProducts || null)
      );


    this.shoppingCart$
      .pipe(
        switchMap(shoppingCart => {
          if (shoppingCart) {
            this.shoppingCart = {
              ...shoppingCart,
              products: {}
            }
          } else {
            of(null);
          }

          return this.shoppingCartProducts$;
        })
      )
      .subscribe(shoppingCartProducts => {
        if (shoppingCartProducts) {
          shoppingCartProducts.forEach(product => {
            if (this.shoppingCart && product.shoppingCartId === this.shoppingCartId) {
              this.shoppingCart.products[product.id] = { count: product.count };
            }
          })
        }
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
    Object.values(this.shoppingCart.products).forEach(amount => count += amount.count);
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
  async handleShoppingCartProduct(productId: string, product: ShoppingCartProduct) {
    let shoppingCart = this.shoppingCart;

    if (!shoppingCart) {

      if (product.count > 0)
        this.newShoppingCart(productId, product);

    } else {

      return (product.count > 0) ?
        this.updateShoppingCartProduct(shoppingCart, productId, product) :
        this.removeProduct(shoppingCart, productId);

    }
  }

  private createShoppingCart(productIds: string[]): DbShoppingCart {
    return {
      id: this.shoppingCartId,
      dateCreated: new Date().getTime(),
      dateOrdered: null,
      userId: this.userId,
      products: productIds
    };
  }

  private createShoppingCartProduct(productId: string, product: ShoppingCartProduct): DbShoppingCartProduct {
    return {
      id: productId,
      shoppingCartId: this.shoppingCartId,
      count: product.count
    };
  }

  private async newShoppingCart(productId: string, product: ShoppingCartProduct) {
    try {
      let shoppingCart = await firstValueFrom(
        this.shoppingCartService.getOrCreate(
          this.createShoppingCart([productId])
        ));

      let shoppingCartProduct = await firstValueFrom(
        this.shoppingCartProductService.getOrCreate(
          this.createShoppingCartProduct(productId, product)
        ));

      if (shoppingCart) {
        this.shoppingCart = {
          ...shoppingCart,
          products: {}
        }

        if (shoppingCartProduct && this.shoppingCart) {
          this.shoppingCart.products[productId] = { count: product.count };
          this.shoppingCartCount$.next(product.count);
        }
      }

    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  private async updateShoppingCart(shoppingCart: DbShoppingCart) {
    try {
      await this.shoppingCartService.update(shoppingCart);
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  private async updateShoppingCartProduct(shoppingCart: ShoppingCart, productId: string, product: ShoppingCartProduct) {
    try {
      let newProduct = (shoppingCart.products[productId] === undefined);

      shoppingCart.products[productId] = { count: product.count };

      if (newProduct) {
        await this.shoppingCartService.update(
          this.createShoppingCart(Object.keys(shoppingCart.products))
        );
      }

      await this.shoppingCartProductService.create(this.createShoppingCartProduct(
        productId,
        product
      ));
      this.shoppingCartCount$.next(this.productCount());
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  private async removeProduct(shoppingCart: ShoppingCart, productId: string) {
    delete shoppingCart.products[productId];

    try {

      await this.shoppingCartProductService.delete(productId);

      if (Object.keys(shoppingCart.products).length === 0) {
        await this.shoppingCartService.delete(this.shoppingCartId);
        this.shoppingCart = null;
      } else {
        await this.shoppingCartService.update(
          this.createShoppingCart(Object.keys(shoppingCart.products))
        );
      }

      this.shoppingCartCount$.next(this.productCount());
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

}
