import { ShoppingCartProductService } from './../../services/database/shopping-cart-product.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';


/**
 * Note: requires the [productId] attribute to be passed.
 */
@Component({
  selector: 'app-product-cart-button[productId]',
  templateUrl: './product-cart-button.component.html',
  styleUrls: ['./product-cart-button.component.sass']
})
export class ProductCartButtonComponent implements OnInit, OnDestroy {

  @Input() productId!: string;

  productCount: number = 0;

  private idSubscription?: Subscription;
  private productCountSubscription?: Subscription;

  constructor(
    private shoppingCartHandlerService: ShoppingCartHandlerService
  ) {
  }

  ngOnInit(): void {
    this.idSubscription = this.shoppingCartHandlerService.shoppingCartId$
      .subscribe(shoppingCartId => {
        if (this.productCountSubscription)
          this.productCountSubscription.unsubscribe();

        this.productCountSubscription = this.shoppingCartHandlerService.shoppingCartProductService
          .get(this.productId)
          .subscribe(product => {
            this.productCount = (product) ? product.count : 0;
          });
      });

  }

  ngOnDestroy(): void {
    if (this.productCountSubscription)
      this.productCountSubscription.unsubscribe();
    if (this.idSubscription)
      this.idSubscription.unsubscribe();
  }

  inc() {
    this.setProductCount(this.productCount + 1);
  }

  dec() {
    this.setProductCount(this.productCount - 1);
  }

  private setProductCount(productCount: number) {
    if (productCount < 0)
      return;

    this.productCount = productCount;
    this.shoppingCartHandlerService.handleShoppingCartProduct(this.productId, { count: productCount });
  }

}
