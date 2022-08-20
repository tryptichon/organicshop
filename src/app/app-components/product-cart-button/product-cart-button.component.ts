import { Observable, switchMap, filter, map, Subscription } from 'rxjs';
import { DbShoppingCart } from './../../model/db-shopping-cart';
import { ShoppingCartService } from './../../services/database/shopping-cart.service';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';

@Component({
  selector: 'app-product-cart-button',
  templateUrl: './product-cart-button.component.html',
  styleUrls: ['./product-cart-button.component.sass']
})
export class ProductCartButtonComponent implements OnInit, OnDestroy {

  shoppingCartId: string;

  @Input() productId?: string | null;

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
    if (!this.productId)
      return;

    this.valueSubscription = this.shoppingCartService.get(this.shoppingCartId)
      .pipe(
        map(shoppingCart => (this.productId) ? shoppingCart.products[this.productId] : undefined)
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
