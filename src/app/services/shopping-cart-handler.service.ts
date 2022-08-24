import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { filter, firstValueFrom, map, Observable, of, switchMap, take, withLatestFrom } from 'rxjs';
import { DbShoppingCart, DbShoppingCartProduct, ShoppingCart } from '../model/shopping-cart';
import { ShoppingCartProduct } from './../model/shopping-cart';
import { LoginService } from './auth/login.service';
import { ProductService } from './database/product.service';
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

  /** This id is bound to a browser. */
  shoppingCartId: string;

  /** Will be set according to the current logged in user. */
  userId: string | null = null;

  /** Local copy of the current shopping cart. */
  // shoppingCart: ShoppingCart | null = null;

  shoppingCartProductService!: ShoppingCartProductService

  /**
   * This service handles the shopping cart.
   *
   * @param shoppingCartService The database backend for shopping cart data.
   * @param loginService To observe user login/logout.
   */
  constructor(
    private productService: ProductService,
    private shoppingCartService: ShoppingCartService,
    private loginService: LoginService,
    firestore: Firestore
  ) {
    this.shoppingCartId = shoppingCartService.getUniqueId();

    this.shoppingCartProductService = new ShoppingCartProductService(this.shoppingCartId, firestore);

    this.shoppingCart$ = this.shoppingCartService.get(this.shoppingCartId)
      .pipe(
        map(shoppingCart => shoppingCart || null)
      );

    this.shoppingCartProducts$ = this.shoppingCartProductService.getDocuments$()
      .pipe(
        map(shoppingCartProducts => shoppingCartProducts || null)
      );

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
   * This method also creates and deletes shopping carts and product entries within shopping carts.
   *
   * count > 0 and no shopping cart? Create a shopping cart with the shoppingCartId and add the product.
   *
   * Product count in shopping cart === 0 ? delete this product from the shopping cart.
   *
   * Shopping cart has no products at all anymore? delete this shopping cart from the array of shopping carts.
   *
   * @param productId The id of the product.
   * @param product The shoppingCartProduct-data itself.
   * @returns A promise that resolves when the process has finished.
   */
  async handleShoppingCartProduct(productId: string, product: ShoppingCartProduct) {

    let shoppingCart = await firstValueFrom(this.shoppingCartProducts$
      .pipe(
        switchMap(dbShoppingCartProducts => {
          if (!dbShoppingCartProducts)
            return of(null);

          let promises: Promise<DbShoppingCartProduct>[] = [];

          dbShoppingCartProducts.forEach(dbShoppingCartProduct => {
            promises.push(
              firstValueFrom(this.productService.get(dbShoppingCartProduct.id)
                .pipe(
                  map(product => ({ ...product, count: dbShoppingCartProduct.count }))
                )
              )
            )
          })

          return Promise.all(promises);
        }),
        filter(shoppingCartProducts => !!shoppingCartProducts),
        withLatestFrom(this.shoppingCart$),
        map(([shoppingCartProducts, dbShoppingCart]) => {
          if (!dbShoppingCart)
            return null;

          let shoppingCart: ShoppingCart = {
            ...dbShoppingCart,
            products: {}
          }

          if (shoppingCartProducts) {
            shoppingCartProducts.forEach(shoppingCartProduct => {
              if (shoppingCart)
                shoppingCart.products[shoppingCartProduct.id] = { count: shoppingCartProduct.count };
            });
          }

          return shoppingCart;
        }),
        take(1)
      )
    );

    if (!shoppingCart) {

      if (product.count > 0)
        this.newShoppingCart(productId, product);

    } else {

      return (product.count > 0) ?
        this.updateShoppingCartProduct(shoppingCart, productId, product) :
        this.removeProduct(shoppingCart, productId);

    }
  }

  private createShoppingCart(): DbShoppingCart {
    return {
      id: this.shoppingCartId,
      dateCreated: new Date().getTime(),
      dateOrdered: null,
      userId: this.userId
    };
  }

  private createShoppingCartProduct(productId: string, product: ShoppingCartProduct): DbShoppingCartProduct {
    return {
      id: productId,
      ...product
    };
  }

  private async newShoppingCart(productId: string, product: ShoppingCartProduct) {
    try {
      let shoppingCart = await firstValueFrom(
        this.shoppingCartService.getOrCreate(
          this.createShoppingCart()
        ));


      let shoppingCartProduct = await firstValueFrom(
        this.shoppingCartProductService.getOrCreate(
          this.createShoppingCartProduct(productId, product)
        ));

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
      shoppingCart.products[productId] = { count: product.count };

      await this.shoppingCartProductService.create(this.createShoppingCartProduct(
        productId,
        product
      ));

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
      }

    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

}
