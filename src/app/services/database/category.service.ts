import { Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import { DbCategory } from './../../model/db-category';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends AbstractCrudService<DbCategory> implements OnDestroy {

  constructor(firestore: Firestore) {
    super('categories', firestore);
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  getCategoryName(category?: string | null) {
    return (!category) ? undefined : this.documentCache[category]?.name;
  }

}
