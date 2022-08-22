import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { filter, Subscription } from 'rxjs';
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

  private _value: number = 0;
  @Output() valueChange = new EventEmitter<number>();

  @Input()
  set value(value: number) {
    this._value = value;

    this.shoppingCartHandlerService.handleShoppingCartProduct(this.productId, { count: value});

    this.valueChange.emit(value);
  }

  get value(): number {
    return this._value;
  }

  private valueSubscription?: Subscription;

  constructor(
    private shoppingCartHandlerService: ShoppingCartHandlerService
  ) {
  }

  ngOnInit(): void {
    this.valueSubscription = this.shoppingCartHandlerService.shoppingCartProductService.get(this.productId)
      .pipe(
        filter(product => !!product),
      )
      .subscribe(product => {
        this._value = product.count;
      });
  }

  ngOnDestroy(): void {
    if (this.valueSubscription)
      this.valueSubscription.unsubscribe();
  }

  inc() {
    this.value++;
  }

  dec() {
    if (this.value > 0)
      this.value--;
  }

}
