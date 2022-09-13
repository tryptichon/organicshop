import { DialogHandler } from './../dialogs/DialogHandler';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, take, tap } from 'rxjs';
import { ShoppingCartService } from 'src/app/services/database/shopping-cart.service';


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
    private shoppingCartService: ShoppingCartService,
    private dialogs: DialogHandler
  ) {
  }

  ngOnInit(): void {
    this.productCountSubscription = this.shoppingCartService.shoppingCartProducts$
      .subscribe(products => {
        this.productCount = products.getProductQuantity(this.productId) || 0;
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

  private async setProductCount(productCount: number) {
    if (productCount < 0)
      return;

    try {
      await this.shoppingCartService.handleShoppingCartProduct({ id: this.productId, count: productCount });
      this.productCount = productCount;
    } catch (error) {
      this.dialogs.error({ title: 'Shopping Cart Communication Error', message: error });
    };
  }

}
