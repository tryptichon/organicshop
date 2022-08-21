import { Injectable, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import { DbProduct } from './../../model/db-product';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends AbstractCrudService<DbProduct> {

  productCache = new Map<string, DbProduct>();

  constructor(firestore: Firestore) {
    super('products', firestore);

    this.documents$
      .subscribe(documents => {
        this.productCache = new Map<string, DbProduct>(documents.map(document => [document.id, document]));
      });
  }

}
