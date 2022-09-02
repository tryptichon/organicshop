import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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

  private productCountSubscription?: Subscription;

  constructor(
    private shoppingCartHandlerService: ShoppingCartHandlerService
  ) {
  }

  ngOnInit(): void {
    this.productCountSubscription = this.shoppingCartHandlerService.shoppingCartProducts$
      .subscribe(products => {
        this.productCount = products.getShoppingCartProductQuantity(this.productId);
      });
  }

  ngOnDestroy(): void {
    if (this.productCountSubscription)
      this.productCountSubscription.unsubscribe();
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
