import { Firestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { DbOrder } from 'src/app/model/db-order';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends AbstractCrudService<DbOrder> {

  constructor(firestore: Firestore) {
    super('orders', firestore);
  }
}
