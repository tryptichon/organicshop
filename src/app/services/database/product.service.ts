import { Injectable, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import { DbProduct } from './../../model/db-product';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends AbstractCrudService<DbProduct> {

  constructor(firestore: Firestore) {
    super('products', firestore);
  }

}
