import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { catchError, firstValueFrom, from, of, startWith, Subject, Subscription, switchMap, take, tap, withLatestFrom } from 'rxjs';
import { DbProduct } from '../model/db-product';
import { DbShoppingCart, DbShoppingCartProduct } from '../model/shopping-cart';
import { DialogHandler } from './../app-components/dialogs/DialogHandler';
import { ShoppingCartProduct } from './../model/shopping-cart';
import { LoginService } from './auth/login.service';
import { ProductService } from './database/product.service';
import { ShoppingCartProductService } from './database/shopping-cart-product.service';
import { ShoppingCartService } from './database/shopping-cart.service';

export interface ResolvedShoppingCartProduct extends DbProduct {
  count: number
}

/**
 * This service handles the shopping cart.
 */
@Injectable({
  providedIn: 'root'
})
export class ShoppingCartHandlerService {

  /** Observable for changes to the shoppingCartId. */
  shoppingCartId$ = new Subject<string>();

  /** The current shoppingCartId */
  shoppingCartId: string;

  private shoppingCartProductService!: ShoppingCartProductService

  /** Track current status of login */
  private userId: string | null = null;

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
    private dialogs: DialogHandler,
    private firestore: Firestore
  ) {
    this.shoppingCartId = shoppingCartService.getDefaultShoppingCartId();
    this.changeShoppingCart(this.shoppingCartId);

    this.loginService.appUser$
      .pipe(
        switchMap(user => (!user) ? of(null) : from(shoppingCartService.getShoppingCarts(user.id))
          .pipe(
            catchError(error => {
              dialogs.error({
                title: "Get Shopping Carts of User",
                message: error
              });
              return of(null);
            })
          )
        ),
        withLatestFrom(this.loginService.appUser$)
      )
      .subscribe(([shoppingCarts, dbUser]) => {
        if (dbUser === null) {

          // Logout
          if (this.userId !== null) {

            // If a user has been logged in before, get back the default
            // shopping cart Id so it does not overwrite the cart of the
            // previous user.
            this.changeShoppingCart(shoppingCartService.getDefaultShoppingCartId());
          }

          this.userId = null;
        } else {

          // Login
          if (!shoppingCarts?.length) {

            // No shopping cart assigned to user => assign the default shopping cart
            // if it exists.
            this.shoppingCartService.get(this.shoppingCartId)
              .pipe(
                take(1),
                catchError(error => {
                  dialogs.error({
                    title: "Get Default Shopping Cart",
                    message: error
                  });
                  return of(null);
                })
              )
              .subscribe(
                defaultShoppingCart => {
                  if (!defaultShoppingCart)
                    return;

                  defaultShoppingCart.userId = dbUser.id;
                  this.updateShoppingCart(defaultShoppingCart);
                }
              );

          } else {

            // Use the shopping cart of the user
            let shoppingCart = shoppingCarts[0];
            this.changeShoppingCart(shoppingCart.id);
          }

          this.userId = dbUser.id;
        }

      });

  }

  private changeShoppingCart(shoppingCartId: string) {
    this.shoppingCartId = shoppingCartId;
    this.shoppingCartProductService = this.getShoppingCartProductService(shoppingCartId);

    this.shoppingCartId$.next(shoppingCartId);
  }

  /**
   * Install a callback for changes of the shoppingCartId. When the callback is installed,
   * it gets called once with the current this.shoppingCartId.
   *
   * @param callback Callback function that gets called whenever the shoppingCartId changes.
   * @returns A reference to the Subscription to this.shoppingCartId$. Calling modules need
   *          this reference to be able to unsubscribe the installed callback function.
   */
  onShoppingCartChanged(callback: (shoppingCartId: string) => void): Subscription {
    return this.shoppingCartId$
      .pipe(
        startWith(this.shoppingCartId)
      )
      .subscribe(shoppingCartId => callback(shoppingCartId));
  }

  /**
   * @param shoppingCartId The id of the shopping cart containing the products.
   * @returns A new instance of a ShoppingCartProductService.
   */
  getShoppingCartProductService(shoppingCartId: string): ShoppingCartProductService {
    return new ShoppingCartProductService(shoppingCartId, this.firestore);
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
  handleShoppingCartProduct(productId: string, product: ShoppingCartProduct) {
    return firstValueFrom(this.shoppingCartProductService.getAll()
      .pipe(
        tap(shoppingCartProducts => {
          if (shoppingCartProducts.length == 0) {

            if (product.count > 0)
              this.newShoppingCart(productId, product);

          } else {

            if (product.count > 0) {
              this.updateShoppingCartProduct(productId, product);
            } else {
              this.removeProduct(shoppingCartProducts, productId);
            }

          }
        })
      )
    );
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
      await firstValueFrom(
        this.shoppingCartService.getOrCreate(
          this.createShoppingCart()
        ))


      await firstValueFrom(
        this.shoppingCartProductService.getOrCreate(
          this.createShoppingCartProduct(productId, product)
        ));

    } catch (error) {
      this.dialogs.error({ title: 'New Shopping Cart Communication Error', message: error });
    }
  }

  private async updateShoppingCart(shoppingCart: DbShoppingCart) {
    try {
      await this.shoppingCartService.update(shoppingCart);
    } catch (error) {
      this.dialogs.error({ title: 'Update Shopping Cart Communication Error', message: error });
    }
  }

  private async updateShoppingCartProduct(productId: string, product: ShoppingCartProduct) {
    try {
      await this.shoppingCartProductService.create(this.createShoppingCartProduct(
        productId,
        product
      ));

    } catch (error) {
      this.dialogs.error({ title: 'Update Shopping Cart Product Communication Error', message: error });
    }
  }

  private async removeProduct(products: DbShoppingCartProduct[], productId: string) {
    try {
      await this.shoppingCartProductService.delete(productId);

      if ((products.filter(product => product.id != productId)).length === 0) {
        await this.shoppingCartService.delete(this.shoppingCartId);
      }

    } catch (error) {
      this.dialogs.error({ title: 'Remove Product from Shopping Cart Communication Error', message: error });
    }
  }

}
