import { Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

import { DbCategory } from './../../model/db-category';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends AbstractCrudService<DbCategory> implements OnDestroy {

  protected categoryCache = new Map<string, DbCategory>();

  private documentSubscription: Subscription;

  constructor(firestore: Firestore) {
    super('categories', firestore);

    this.documentSubscription = this.documents$
      .subscribe(documents => {
        this.categoryCache = new Map<string, DbCategory>(documents.map(document => [document.id, document]));
      });

  }

  ngOnDestroy(): void {
    this.documentSubscription.unsubscribe();
  }

  /**
   * @param category The id of a category
   * @returns The name of the category obtained from the {@link categoryCache}.
   */
  getCategoryName(category?: string | null) {
    return (!category) ? undefined : this.categoryCache.get(category)?.name;
  }

  /**
   * @returns An array of the values (DbCategory) from the {@link categoryCache}.
   */
  getCachedCategories() {
    return Array.from(this.categoryCache.values());
  }
}
