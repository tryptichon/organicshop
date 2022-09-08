import { Firestore, runTransaction } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { DbOrder } from 'src/app/model/db-order';
import { AbstractCrudService } from './abstract-crud.service';
import { ShoppingCartService } from './shopping-cart.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends AbstractCrudService<DbOrder> {

  constructor(
    firestore: Firestore,
    private shoppingCartService: ShoppingCartService
  ) {
    super('orders', firestore);
  }

  async createOrderAndClearShoppingCart(order: DbOrder) {
    let ids = await this.shoppingCartService.shoppingCartProductService.getIds();

    await runTransaction(this.firestore, async (transaction) => {
      this.createT(transaction, order);
      this.shoppingCartService.deleteShoppingCartT(transaction, ids);
    });
  }
}
