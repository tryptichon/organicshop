import { Firestore } from '@angular/fire/firestore';
import { DbProduct } from './../../model/db-product';
import { Injectable, OnDestroy } from '@angular/core';
import { AbstractCrudService } from './abstract-crud.service';
import { BehaviorSubject } from 'rxjs';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends AbstractCrudService<DbProduct> implements OnDestroy {

  constructor(firestore: Firestore) {
    super('products', firestore);
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
