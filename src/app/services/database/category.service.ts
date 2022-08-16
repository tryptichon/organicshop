import { Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

import { DbCategory } from './../../model/db-category';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends AbstractCrudService<DbCategory> implements OnDestroy {

  protected categoryCache: { [key: string]: DbCategory } = {};

  private documentSubscription: Subscription;

  constructor(firestore: Firestore) {
    super('categories', firestore);

    this.documentSubscription = this.documents$
      .subscribe(documents =>
        documents.forEach(document => this.categoryCache[document.id] = document)
      );

  }

  ngOnDestroy(): void {
    this.documentSubscription.unsubscribe();
  }

  getCategoryName(category?: string | null) {
    return (!category) ? undefined : this.categoryCache[category]?.name;
  }

}
