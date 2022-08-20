import { ShoppingCartService } from './../../services/database/shopping-cart.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-product-cart-button',
  templateUrl: './product-cart-button.component.html',
  styleUrls: ['./product-cart-button.component.sass']
})
export class ProductCartButtonComponent {

  shoppingCartId: string;

  @Input() productId?: string | null;


  private _value: number = 0;
  @Output() valueChange = new EventEmitter<number>();

  @Input()
  set value(value: number) {
    this._value = value;
    this.valueChange.emit(value);
  }

  get value(): number {
    return this._value;
  }


  constructor(
    private shoppingCartService: ShoppingCartService
  ) {
    this.shoppingCartId = shoppingCartService.getUniqueId();
  }

  inc() {
    this.value++;
  }

  dec() {
    if (this.value > 0)
      this.value--;
  }

}
