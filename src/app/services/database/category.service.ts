import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import { DbCategory } from './../../model/db-category';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends AbstractCrudService<DbCategory> {

  private categoryCache = new Map<string, DbCategory>();

  constructor(firestore: Firestore) {
    super('categories', firestore);

    this.documents$
      .subscribe(documents => {
        this.categoryCache = new Map<string, DbCategory>(documents.map(document => [document.id, document]));
      });
  }

  /**
   * @param category The id of a category
   * @returns The name of the category obtained from the {@link categoryCache}.
   */
   getCategoryName(category?: string | null): string | undefined {
    return (!category) ? undefined : this.categoryCache.get(category)?.name;
  }

  /**
   * @returns An array of the values (DbCategory) from the {@link categoryCache}.
   */
  getCachedCategories() : DbCategory[] {
    return Array.from(this.categoryCache.values());
  }
}
