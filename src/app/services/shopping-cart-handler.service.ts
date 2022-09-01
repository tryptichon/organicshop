import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { catchError, firstValueFrom, forkJoin, from, map, of, ReplaySubject, switchMap, take, withLatestFrom, Subscription, combineLatest } from 'rxjs';
import { DialogHandler } from './../app-components/dialogs/DialogHandler';
import { DbShoppingCart, DbShoppingCartProduct, ShoppingCart, ShoppingCartProduct } from './../model/shopping-cart';
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

  /** Observable for changes to the shoppingCart. Replays the last
   *  emitted shoppingCartId on subscription. */
  shoppingCart$ = new ReplaySubject<ShoppingCart>(1);

  /** The current shoppingCartId */
  private shoppingCartId: string;

  shoppingCartProductService!: ShoppingCartProductService

  /** Track current status of login */
  private userId: string | null = null;

  private shoppingCartDataSubscription?: Subscription;

  /**
   * This service handles the shopping cart.
   *
   * @param shoppingCartService The database backend for shopping cart data.
   * @param loginService To observe user login/logout.
   */
  constructor(
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
          this.onLogout();
        } else {
          this.onLogin(dbUser.id, shoppingCarts);
        }
      });

  }

  /**
   * If a user has been logged in before, get back the default
   * shopping cart id so it does not overwrite the cart of the
   * previous user.
   */
  private onLogout() {
    if (this.userId !== null) {
      this.changeShoppingCart(this.shoppingCartService.getDefaultShoppingCartId());
    }

    this.userId = null;
  }

  /**
   * If the user has a shopping cart assigned, use its shoppingCartId, else assign
   * the current default shopping cart - if it exists - to this user.
   *
   * @param userId The userId of the new user.
   * @param shoppingCarts The array of shoppingCarts. If this is empty or null, the
   *                      the userId will be set to the default shopping cart, making it
   *                      a shopping cart of that user.
   */
  private onLogin(userId: string, shoppingCarts: DbShoppingCart[] | null) {
    if (!shoppingCarts?.length) {
      this.assignDefaultShoppingCartToUser(userId);
    } else {
      this.changeShoppingCart(shoppingCarts[0].id)
    }

    this.userId = userId;
  }

  /**
   * Assign this userId to the default shopping cart if it exists. Then
   * set a new id for the default shopping cart so the next user starts
   * with his/her own.
   *
   * @param userId The userId to set for the default shopping cart.
   */
  private assignDefaultShoppingCartToUser(userId: string) {
    this.shoppingCartService.get(this.shoppingCartId)
      .pipe(
        take(1),
        catchError(error => {
          this.dialogs.error({
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

          defaultShoppingCart.userId = userId;
          this.updateShoppingCart(defaultShoppingCart);
          this.shoppingCartService.nextShoppingCartId();
        }
      );
  }

  private changeShoppingCart(shoppingCartId: string) {
    this.shoppingCartId = shoppingCartId;
    this.shoppingCartProductService = new ShoppingCartProductService(shoppingCartId, this.firestore);

    if (this.shoppingCartDataSubscription)
      this.shoppingCartDataSubscription.unsubscribe();

    this.shoppingCartDataSubscription = combineLatest([
      this.shoppingCartService.get(shoppingCartId),
      this.shoppingCartProductService.getAll()
    ])
      .subscribe(([shoppingCartData, shoppingCartProductData]) => {
        this.shoppingCart$.next(new ShoppingCart(shoppingCartData, shoppingCartProductData));
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
   * @param product The shoppingCartProduct-data itself. Contains the current count.
   * @returns A promise that resolves when the process has finished.
   */
  handleShoppingCartProduct(productId: string, product: ShoppingCartProduct) {
    return firstValueFrom(this.shoppingCartProductService.getAll()
      .pipe(
        switchMap(shoppingCartProducts => {
          if (shoppingCartProducts.length == 0) {

            if (product.count > 0) {
              return this.newShoppingCart(productId, product);
            } else {
              return of();
            }

          } else {

            if (product.count > 0) {
              return this.updateShoppingCartProduct(productId, product);
            } else {
              return this.removeProduct(this.shoppingCartProductService, shoppingCartProducts, this.shoppingCartId, productId);
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

  private async removeProduct(shoppingCartProductService: ShoppingCartProductService, products: DbShoppingCartProduct[], shoppingCartId: string, productId: string) {
    try {
      await shoppingCartProductService.delete(productId);

      if ((products.filter(product => product.id != productId)).length === 0) {
        await this.shoppingCartService.delete(shoppingCartId);
      }

    } catch (error) {
      this.dialogs.error({ title: 'Remove Product from Shopping Cart Communication Error', message: error });
    }
  }

  /**
   * Remove a product from all shopping carts.
   *
   * @param productId The productId of the product to remove.
   * @returns A promise that completes when the process has finished.
   */
  async removeProductFromAllCarts(productId: string) {
    return await firstValueFrom(this.shoppingCartService.getAll()
      .pipe(
        switchMap(shoppingCarts => {
          let promises: Promise<void>[] = [];

          shoppingCarts.forEach(shoppingCart => {
            let shoppingCartProductService = new ShoppingCartProductService(shoppingCart.id, this.firestore);

            promises.push(firstValueFrom(shoppingCartProductService.getAll()
              .pipe(
                switchMap(products => this.removeProduct(shoppingCartProductService, products, shoppingCart.id, productId))
              )
            ));
          });

          return Promise.all(promises);
        })
      ));
  }

}
