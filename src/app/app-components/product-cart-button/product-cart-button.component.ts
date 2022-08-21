import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { filter, map, Subscription } from 'rxjs';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';
import { ShoppingCartService } from './../../services/database/shopping-cart.service';

/**
 * Note: requires the [productId] attribute to be passed.
 */
@Component({
  selector: 'app-product-cart-button[productId]',
  templateUrl: './product-cart-button.component.html',
  styleUrls: ['./product-cart-button.component.sass']
})
export class ProductCartButtonComponent implements OnInit, OnDestroy {

  shoppingCartId: string;

  @Input() productId!: string;

  private _value: number = 0;
  @Output() valueChange = new EventEmitter<number>();

  @Input()
  set value(value: number) {
    this._value = value;

    if (this.productId)
      this.shoppingCartHandlerService.setShoppingCartProduct(this.productId, value);

    this.valueChange.emit(value);
  }

  get value(): number {
    return this._value;
  }

  private valueSubscription?: Subscription;

  constructor(
    private shoppingCartHandlerService: ShoppingCartHandlerService,
    private shoppingCartService: ShoppingCartService
  ) {
    this.shoppingCartId = this.shoppingCartHandlerService.shoppingCartId;
  }

  ngOnInit(): void {
    this.valueSubscription = this.shoppingCartService.get(this.shoppingCartId)
      .pipe(
        filter(shoppingCart => !!shoppingCart),
        map(shoppingCart => shoppingCart.products[this.productId])
      )
      .subscribe(count => {
        if (count !== undefined)
          this._value = count;
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
