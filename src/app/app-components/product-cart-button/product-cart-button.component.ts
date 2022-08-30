import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';

export interface ProductCartButtonEvent {
  count: number,
  productId: string,
  shoppingCartId: string
}

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

  private _value: number = 0;
  @Output() valueChange = new EventEmitter<ProductCartButtonEvent>();

  @Input()
  set value(value: number) {
    this._value = value;

    this.shoppingCartHandlerService.handleShoppingCartProduct(this.productId, { count: value });

    this.valueChange.emit({
      count: value,
      productId: this.productId,
      shoppingCartId: this.shoppingCartHandlerService.shoppingCartId
    });
  }

  get value(): number {
    return this._value;
  }

  private idSubscription?: Subscription;
  private valueSubscription?: Subscription;

  constructor(
    private shoppingCartHandlerService: ShoppingCartHandlerService
  ) {
  }

  ngOnInit(): void {
    this.idSubscription = this.shoppingCartHandlerService.onShoppingCartChanged(shoppingCartId => {
      if (this.valueSubscription)
        this.valueSubscription.unsubscribe();

      this.valueSubscription = this.shoppingCartHandlerService
        .getShoppingCartProductService(shoppingCartId)
        .get(this.productId)
        .subscribe(product => {
          this._value = (product) ? product.count : 0;
        });
    });

  }

  ngOnDestroy(): void {
    if (this.valueSubscription)
      this.valueSubscription.unsubscribe();
    if (this.idSubscription)
      this.idSubscription.unsubscribe();
  }

  inc() {
    this.value++;
  }

  dec() {
    if (this.value > 0)
      this.value--;
  }

}
